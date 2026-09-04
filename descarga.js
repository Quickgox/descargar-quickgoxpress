// 1. EFECTO CANVAS DE PARTICULAS (Fondo dinámico)
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = [];
for (let i = 0; i < 50; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#00f2ff' : '#ff2a5f',
        speedY: Math.random() * -0.5 - 0.2,
        alpha: Math.random() * 0.5 + 0.2
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        p.y += p.speedY;
        if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
        }
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// 2. CONTROL DE INSTALACIÓN DIRECTA PWA
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Si la app se puede instalar, nos aseguramos que el botón diga "Instalar App"
    const btnText = document.getElementById('btnInstallText');
    if (btnText) btnText.textContent = "Instalar App";
});

function installOrOpenApp(targetUrl) {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('El usuario aceptó la instalación');
                const btnText = document.getElementById('btnInstallText');
                if (btnText) btnText.textContent = "Abrir Web App";
            }
            deferredPrompt = null;
        });
    } else {
        // Si ya está instalada o el navegador no soporta prompt directo, abre la app directamente
        window.open(targetUrl, '_blank');
    }
}

// 3. BUSCADOR
function filterApps() {
    let input = document.getElementById('appSearch').value.toLowerCase();
    let apps = document.getElementsByClassName('app-row');

    for (let i = 0; i < apps.length; i++) {
        let appName = apps[i].getAttribute('data-name').toLowerCase();
        apps[i].style.display = appName.includes(input) ? "grid" : "none";
    }
}

// 4. PERSISTENCIA DE ESTRELLAS Y COMENTARIOS CON LOCALSTORAGE
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.app-row').forEach(appRow => {
        const appId = appRow.getAttribute('data-appid');
        loadAppData(appRow, appId);
        setupStars(appRow, appId);
    });
});

function loadAppData(appRow, appId) {
    const data = JSON.parse(localStorage.getItem(`app_data_${appId}`)) || {
        userRating: 0,
        votersCount: 0,
        starsSum: 0,
        comments: []
    };

    appRow.querySelector('.total-voters').textContent = data.votersCount;
    appRow.querySelector('.total-stars').textContent = data.starsSum;

    const stars = appRow.querySelectorAll('.stars-rating .star');
    stars.forEach((s, idx) => {
        if (idx < data.userRating) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });

    const list = appRow.querySelector('.comments-list');
    list.innerHTML = "";
    data.comments.forEach(txt => {
        const li = document.createElement('li');
        li.textContent = "💬 " + txt;
        list.appendChild(li);
    });
}

function setupStars(appRow, appId) {
    const stars = appRow.querySelectorAll('.stars-rating .star');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const selectedValue = parseInt(star.getAttribute('data-value'));
            let data = JSON.parse(localStorage.getItem(`app_data_${appId}`)) || {
                userRating: 0,
                votersCount: 0,
                starsSum: 0,
                comments: []
            };

            if (data.userRating === 0) {
                data.votersCount += 1;
                data.starsSum += selectedValue;
            } else {
                data.starsSum = data.starsSum - data.userRating + selectedValue;
            }

            data.userRating = selectedValue;
            localStorage.setItem(`app_data_${appId}`, JSON.stringify(data));
            loadAppData(appRow, appId);
        });
    });
}

function addComment(button) {
    const appRow = button.closest('.app-row');
    const appId = appRow.getAttribute('data-appid');
    const input = appRow.querySelector('.comment-input');

    if (input.value.trim() !== "") {
        let data = JSON.parse(localStorage.getItem(`app_data_${appId}`)) || {
            userRating: 0,
            votersCount: 0,
            starsSum: 0,
            comments: []
        };

        data.comments.push(input.value.trim());
        localStorage.setItem(`app_data_${appId}`, JSON.stringify(data));

        input.value = "";
        loadAppData(appRow, appId);
    }
}
