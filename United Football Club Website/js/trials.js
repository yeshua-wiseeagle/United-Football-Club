// js/trials.js - Academy Trials with Confetti + Supabase

document.getElementById("trialsForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = {
        full_name: document.getElementById("fullName").value.trim(),
        dob: document.getElementById("dob").value || null,
        position: document.getElementById("position").value || null,
        preferred_foot: document.getElementById("preferredFoot").value || null,
        height: parseInt(document.getElementById("height").value) || null,
        phone: document.getElementById("phone").value.trim() || null,
        guardian: document.getElementById("guardian").value.trim() || null,
        email: document.getElementById("email").value.trim() || null,
        message: document.getElementById("message").value.trim() || null,
        status: "Pending"
    };

    // Validation
    if (!formData.full_name || !formData.dob || !formData.position || !formData.phone || !formData.email) {
        alert("Please fill all required fields (*)");
        return;
    }

    const submitBtn = document.getElementById("trialsSubmitBtn") || this.querySelector("button[type='submit']");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
    }

    // Save to Supabase
    const { error } = await supabaseClient
        .from("trial_applications")
        .insert([formData]);

    if (error) {
        console.error(error);
        alert("❌ Failed to submit application. Please try again.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Application";
        }
        return;
    }

    // Success → show confetti
    showSuccessWithConfetti(formData.full_name);

    // Reset form
    this.reset();

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Application";
    }
});

// ====================== SUCCESS MODAL + CONFETTI ======================
function showSuccessWithConfetti(name) {
    const modal = document.createElement("div");
    modal.className = "success-modal";
    modal.innerHTML = `
        <div class="success-content">
            <div class="success-checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="25" fill="none"/>
                    <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
            </div>
            <h2>Application Submitted Successfully!</h2>
            <p>Thank you, <strong>${name}</strong>!</p>
            <p class="small">Our coaching team will review your application and contact you soon.</p>
            <button class="success-close-btn">Close Window</button>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("show"), 10);

    // Launch Confetti
    launchConfetti();

    // Close button
    modal.querySelector(".success-close-btn").addEventListener("click", () => {
        modal.classList.remove("show");
        setTimeout(() => modal.remove(), 500);
    });

    // Auto close after 7 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.classList.remove("show");
            setTimeout(() => modal.remove(), 500);
        }
    }, 7000);
}

// ====================== CONFETTI FUNCTION ======================
function launchConfetti() {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "10001";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ["#0b2c8f", "#1e4ab8", "#ffcc00", "#ff3366", "#33cc66", "#ffffff"];

    class ConfettiPiece {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 12 + 6;
            this.speed = Math.random() * 6 + 4;
            this.angle = Math.random() * 360;
            this.rotationSpeed = Math.random() * 0.2 - 0.1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.y += this.speed;
            this.angle += this.rotationSpeed;
            this.speed += 0.05;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }

    for (let i = 0; i < 180; i++) {
        confetti.push(new ConfettiPiece());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((piece, index) => {
            piece.update();
            piece.draw();

            if (piece.y > canvas.height) {
                confetti.splice(index, 1);
            }
        });

        if (confetti.length > 0) {
            requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    }

    animate();
}