/* ==========================================================================
   1. GLOBAL VARIABLES & CONFIGURATION
   ========================================================================== */
let isAdmin = false;
let currentSelectedVersion = "v1.2.4";

// Download links configuration
const downloadLinks = {
    "v1.2.4": { "Windows": "#", "macOS": "#", "Android": "#" },
    "v1.2.3": { "Windows": "#", "macOS": "#", "Android": "#" },
    "v1.2.0": { "Windows": "#", "macOS": "#", "Android": "#" },
    "v1.0.1": { "Windows": "#", "macOS": "#", "Android": "#" }
};

/* ==========================================================================
   2. NAVIGATION & MODALS
   ========================================================================== */
function show(id) {
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
        window.scrollTo(0, 0);
    }
}

function openPostModal() { document.getElementById('post-modal').style.display = 'flex'; }
function closePostModal() { document.getElementById('post-modal').style.display = 'none'; }

function openVideo() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('trailerFrame');
    iframe.src = "trailer.mp4"; // Update with your real video URL
    modal.style.display = 'flex';
}

function closeVideo() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('trailerFrame');
    iframe.src = "";
    modal.style.display = 'none';
}

/* ==========================================================================
   3. ADMIN & MODERATION SYSTEM
   ========================================================================== */
function adminMode() {
    isAdmin = !isAdmin;
    alert(isAdmin ? "ADMIN MODE ACTIVE: You can now delete posts and ban users." : "ADMIN MODE DISABLED.");
    loadPosts();
}

function banUser(email, index) {
    if (confirm(`Are you sure you want to ban the email: ${email}?`)) {
        let bans = JSON.parse(localStorage.getItem('mywings_bans')) || [];
        if (!bans.includes(email)) bans.push(email);
        localStorage.setItem('mywings_bans', JSON.stringify(bans));
        deletePost(index); // Delete the post immediately after banning
        alert("User has been banned.");
    }
}

function unbanEmail(email) {
    let bans = JSON.parse(localStorage.getItem('mywings_bans')) || [];
    bans = bans.filter(e => e !== email);
    localStorage.setItem('mywings_bans', JSON.stringify(bans));
    alert(`Email ${email} has been unbanned.`);
}

function deletePost(index) {
    let posts = JSON.parse(localStorage.getItem('mywings_posts')) || [];
    posts.splice(index, 1);
    localStorage.setItem('mywings_posts', JSON.stringify(posts));
    loadPosts();
}

/* ==========================================================================
   4. DOWNLOAD LOGIC
   ========================================================================== */
function toggleArchive() {
    const archive = document.getElementById('version-archive');
    archive.style.display = (archive.style.display === "none" || archive.style.display === "") ? "block" : "none";
}

function openVersionSelection(version) {
    currentSelectedVersion = version;
    document.getElementById('download-title').innerHTML = `Downloading version <span style="color:#00c6ff;">${version}</span>`;
    document.getElementById('download-subtitle').innerText = "Archive selection applied";
    toggleArchive();
    document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
}

function startDownload(platform) {
    const countdownDiv = document.getElementById('download-countdown');
    const secondsSpan = document.getElementById('seconds');
    const platformSpan = document.getElementById('platform-name');
    const progressBar = document.getElementById('progress-bar');
    const fileToDownload = downloadLinks[currentSelectedVersion][platform];

    countdownDiv.style.display = 'block';
    platformSpan.innerText = `${platform} (Version ${currentSelectedVersion})`;
    
    let timeLeft = 10;
    const downloadTimer = setInterval(() => {
        timeLeft--;
        secondsSpan.innerText = timeLeft;
        progressBar.style.width = (timeLeft * 10) + '%';
        if (timeLeft <= 0) {
            clearInterval(downloadTimer);
            document.getElementById('countdown-text').innerHTML = `<i class="fa-solid fa-check"></i> Download started!`;
            window.location.href = fileToDownload;
            
            setTimeout(() => {
                countdownDiv.style.display = 'none';
                document.getElementById('countdown-text').innerHTML = `Your download for <strong id="platform-name"></strong> starts in <span id="seconds">10</span> seconds...`;
            }, 5000);
        }
    }, 1000);
}

/* ==========================================================================
   5. COMMUNITY SYSTEM (LocalStorage + Image Compression)
   ========================================================================== */
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL('image/jpeg', 0.6));
        };
    };
}

function loadPosts() {
    const feed = document.getElementById('community-feed');
    let posts = JSON.parse(localStorage.getItem('mywings_posts')) || [];

    if (posts.length === 0) {
        posts = [{
            nickname: "MyWings Team",
            message: "Welcome! Share your flying experiences. Admin mode can be toggled via console.",
            image: "https://cdn.flightsim.to/images/27/easyjet-eurovision-2025-fbw-a32nx-g-uzhs-8k-577192-1752760672-MWYhx.jpg",
            date: "System",
            email: "system@mywings.com"
        }];
    }

    feed.innerHTML = posts.map((post, index) => `
        <div class="news-card" style="position: relative; border: 1px solid rgba(255,255,255,0.05);">
            ${isAdmin ? `
                <div style="position: absolute; top: 10px; right: 10px; z-index: 20; display: flex; gap: 5px;">
                    <button onclick="deletePost(${index})" style="background:orange; color:white; border:none; border-radius:5px; cursor:pointer; padding: 5px;"><i class="fa-solid fa-trash"></i></button>
                    <button onclick="banUser('${post.email}', ${index})" style="background:red; color:white; border:none; border-radius:5px; cursor:pointer; padding: 5px;"><i class="fa-solid fa-ban"></i></button>
                </div>
            ` : ''}
            ${post.image ? `<div class="news-image-wrapper" style="height: 200px;"><img src="${post.image}" style="object-fit:cover; width:100%; height:100%;"></div>` : ''}
            <div class="news-body" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="color: #00c6ff; font-weight: bold; font-family: 'Orbitron'; font-size: 13px;">
                        <i class="fa-solid fa-user-astronaut"></i> ${post.nickname}
                    </span>
                    <span style="font-size: 11px; color: #555;">${post.date}</span>
                </div>
                <p style="color: #ccc; font-size: 14px; line-height: 1.4; margin: 0;">${post.message}</p>
            </div>
        </div>
    `).join('');
}

// Handle Community Form Submit
const communityForm = document.getElementById('community-form');
if (communityForm) {
    communityForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('post-email').value.toLowerCase().trim();
        const nickname = document.getElementById('post-nickname').value.trim();
        const message = document.getElementById('post-message').value.trim();
        const fileInput = document.getElementById('post-file');
        
        // BAN CHECK
        const bans = JSON.parse(localStorage.getItem('mywings_bans')) || [];
        if (bans.includes(email)) {
            alert("Your email has been banned for violating our rules!");
            return;
        }

        const processSave = (imgData) => {
            const newPost = { 
                email, 
                nickname, 
                message, 
                image: imgData, 
                date: new Date().toLocaleDateString('en-US') 
            };
            let posts = JSON.parse(localStorage.getItem('mywings_posts')) || [];
            posts.unshift(newPost);
            if (posts.length > 15) posts = posts.slice(0, 15);
            
            try {
                localStorage.setItem('mywings_posts', JSON.stringify(posts));
                this.reset();
                closePostModal();
                loadPosts();
            } catch (err) { 
                alert("Error: Memory is full. Try a smaller image."); 
            }
        };

        if (fileInput.files && fileInput.files[0]) {
            compressImage(fileInput.files[0], (compressed) => processSave(compressed));
        } else {
            processSave(null);
        }
    });
}

/* ==========================================================================
   6. EXTRAS (GALLERY & FLEET)
 ========================================================================== */
let galleryIndex = 0;
function moveGallery(dir) {
    const track = document.getElementById('galleryTrack');
    const images = track.querySelectorAll('img');
    if (!images.length) return;
    galleryIndex = (galleryIndex + dir + images.length) % images.length;
    track.style.transform = `translateX(-${galleryIndex * (images[0].clientWidth + 20)}px)`;
}

const fleet = [
    { name: "Boeing 737-800", desc: "Built for fans of manual flight and precision.", img: "img/1.png" },
    { name: "Airbus A320neo", desc: "Advanced Fly-by-Wire simulation for modern pilots.", img: "img/2.png" }
];
let fleetIdx = 0;
function nextAircraft() {
    fleetIdx = (fleetIdx + 1) % fleet.length;
    document.getElementById('aircraftName').innerText = fleet[fleetIdx].name;
    document.getElementById('aircraftDesc').innerText = fleet[fleetIdx].desc;
    document.getElementById('mainAircraftImg').src = fleet[fleetIdx].img;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadPosts);