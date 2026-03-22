// =============================
// 🌐 AUTO BACKEND URL (WORKS LOCAL + DEPLOYED)
// =============================
const API_URL = window.location.origin;


// =============================
// 🧠 AI PREDICTION FUNCTION
// =============================
async function predict() {
    const inputEl = document.getElementById("input");
    const outputEl = document.getElementById("output");

    // ✅ Safety check
    if (!inputEl || !outputEl) {
        console.error("Missing input/output element");
        return;
    }

    let text = inputEl.value;

    if (!text || text.trim() === "") {
        alert("Please enter your symptoms");
        return;
    }

    // ⏳ Loading UI
    outputEl.innerHTML = "⏳ Analyzing your symptoms...";

    try {
        let res = await fetch(`${API_URL}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        if (!res.ok) {
            throw new Error("Server response failed");
        }

        let data = await res.json();

        if (data.error) {
            outputEl.innerHTML = `⚠️ ${data.error}`;
            return;
        }

        // ✅ SUCCESS UI
        outputEl.innerHTML = `
            <div class="card">
                <h2>🩺 ${data.disease}</h2>
                <p><strong>Confidence:</strong> ${data.confidence}%</p>
                <div class="report">
                    ${data.report}
                </div>
            </div>
        `;

    } catch (err) {
        console.error("Fetch Error:", err);

        outputEl.innerHTML = `
            ⚠️ Unable to connect to server.<br><br>
            ✔ Backend not running OR crashed<br>
            ✔ Wrong API URL<br>
            ✔ Railway deployment not ready
        `;
    }
}


// =============================
// 🎤 VOICE INPUT
// =============================
function startVoice() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Voice not supported in this browser");
        return;
    }

    let recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = function (event) {
        let transcript = event.results[0][0].transcript;
        document.getElementById("input").value = transcript;
    };

    recognition.start();
}


// =============================
// 🌌 3D BACKGROUND (THREE.JS)
// =============================
if (typeof THREE !== "undefined") {

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#bg"),
        alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;

    // 💡 Light
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // 🔵 Particles
    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });

    const particles = [];

    for (let i = 0; i < 200; i++) {
        const particle = new THREE.Mesh(geometry, material);

        particle.position.set(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12
        );

        scene.add(particle);
        particles.push(particle);
    }

    // 🔄 Animation
    function animate() {
        requestAnimationFrame(animate);

        particles.forEach((p, i) => {
            p.rotation.x += 0.005;
            p.rotation.y += 0.005;
            p.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
        });

        renderer.render(scene, camera);
    }

    animate();

    // 📱 Responsive
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}