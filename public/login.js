async function startPayment() {
    const phone = document.getElementById("phone").value.trim();
    const amount = document.getElementById("package").value;

    if (phone.length < 10) {
        alert("Enter a valid phone number");
        return;
    }

    document.getElementById("loading").classList.remove("hidden");

    // Send to backend
    const res = await fetch("/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount })
    });

    const data = await res.json();

    if (data.redirect_url) {
        window.location.href = data.redirect_url; // Pesapal payment page
    } else {
        alert("Payment could not be created.");
    }
}