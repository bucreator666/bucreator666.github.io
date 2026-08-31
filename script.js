// ================================
// BU Creator - Website interactions
// ================================
document.addEventListener("DOMContentLoaded", function () {
    // Smooth scrolling for in-page links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function (e) {
            const selector = this.getAttribute("href");
            const target = selector && document.querySelector(selector);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        });
    });

    // Product Card -> Product Details
    document.querySelectorAll(".card").forEach(card => {
        card.style.cursor = "pointer";
        card.addEventListener("click", function (e) {
            if (e.target.closest(".buy-btn")) return;
            const id = this.dataset.id;
            if (id) window.location.href = "product-details.html?id=" + encodeURIComponent(id);
        });
    });

    if (window.AOS) {
        AOS.init({ duration: 900, once: true, easing: "ease-in-out", offset: 100 });
    }

    const navbar = document.querySelector("nav");
    if (navbar) {
        window.addEventListener("scroll", () => {
            navbar.style.background = "rgb(0, 0, 0)";
            navbar.style.boxShadow = window.scrollY > 5 ? "0 5px 20px #f1d015d5" : "none";
        });
    }

    // Card hover animation
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("mouseenter", () => card.style.transform = "translateY(-10px) scale(1.03)");
        card.addEventListener("mouseleave", () => card.style.transform = "translateY(0px) scale(1)");
    });

    // Hero floating animation
    const heroImage = document.querySelector(".hero-right img");
    if (heroImage) {
        let direction = 1;
        setInterval(() => {
            heroImage.style.transform = `translateY(${direction * 10}px)`;
            direction *= -1;
        }, 1500);
    }

    // Contact form
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const subject = document.getElementById("subject").value;
            const message = document.getElementById("message").value;
            const text = `*New Contact Inquiry*\n\n👤 Name: ${name}\n\n📧 Email: ${email}\n\n📌 Subject: ${subject}\n\n💬 Message:\n${message}`;
            window.open("https://wa.me/923044129971?text=" + encodeURIComponent(text), "_blank");
        });
    }

    // Buy Now WhatsApp Order
    const phoneNumber = "923044129971";
    document.querySelectorAll(".buy-btn").forEach(button => {
        button.addEventListener("click", function (e) {
            e.stopPropagation();
            const card = this.closest(".card");
            if (!card) return;
            const id = card.dataset.id || "";
            const name = card.dataset.name || "";
            const price = card.dataset.price || "";
            const message = `🛍️ *BU CREATOR*\n\n📢 *New Order Request*\n\n🆔 Product ID: ${id}\n\n📦 Product Name: ${name}\n\n💰 Price: Rs. ${price}\n\nAssalam-o-Alaikum,\nMain ye product order karna chahta hoon.\nPlease order confirm kar dein.`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
        });
    });

    // Fade in animation
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0px)";
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll(".card,.about,.contact").forEach(el => {
            el.style.opacity = "0";
            el.style.transform = "translateY(50px)";
            el.style.transition = "all .8s ease";
            observer.observe(el);
        });
    }
});

// Product slider helper
function goToSlide(index) {
    const slider = document.getElementById("slider");
    if (slider) slider.scrollTo({ left: slider.clientWidth * index, behavior: "smooth" });
}

/* ================================
   MOBILE HAMBURGER MENU
================================ */
document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const nav = document.querySelector("nav");

    if (!menuBtn || !nav) return;

    menuBtn.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("menu-open");

        menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        menuBtn.innerHTML = isOpen
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    document.querySelectorAll("nav ul a").forEach(link => {
        link.addEventListener("click", function () {
            nav.classList.remove("menu-open");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
});
