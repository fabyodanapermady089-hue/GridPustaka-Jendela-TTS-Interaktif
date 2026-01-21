// Konfigurasi Papan TTS
const GRID_SIZE = 15; 
let currentData = [];
let userAnswers = {};

// 1. Fungsi Utama: Memuat Kategori/Tema
async function loadCategory(categoryName) {
    try {
        const response = await fetch(`data/${categoryName}.json`);
        if (!response.ok) throw new Error('File tidak ditemukan');
        
        const json = await response.ok ? await response.json() : null;
        currentData = json.data;
        
        // Update Judul dan Deskripsi
        document.getElementById('current-title').innerText = json.edisi;
        
        renderBoard();
        renderClues();
    } catch (error) {
        console.error("Gagal memuat tema:", error);
        alert("Gagal memuat tema. Pastikan file JSON ada di folder data/");
    }
}

// 2. Menggambar Papan TTS
function renderBoard() {
    const board = document.getElementById('tts-board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;

    // Buat grid kosong
    const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));

    // Isi grid dengan data dari JSON
    currentData.forEach(item => {
        let x = item.x;
        let y = item.y;

        for (let i = 0; i < item.jawaban.length; i++) {
            if (item.arah === "mendatar") {
                grid[y][x + i] = { char: item.jawaban[i], no: i === 0 ? item.no : null };
            } else {
                grid[y + i][x] = { char: item.jawaban[i], no: i === 0 ? item.no : null };
            }
        }
    });

    // Render ke HTML
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');

            if (grid[r][c]) {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = r;
                input.dataset.col = c;
                
                // Jika ada nomor soal di awal kata
                if (grid[r][c].no) {
                    const num = document.createElement('span');
                    num.classList.add('cell-number');
                    num.innerText = grid[r][c].no;
                    cell.appendChild(num);
                }

                cell.appendChild(input);
            } else {
                cell.classList.add('black-cell');
            }
            board.appendChild(cell);
        }
    }
}

// 3. Menampilkan Daftar Pertanyaan
function renderClues() {
    const mendatarList = document.getElementById('mendatar-list');
    const menurunList = document.getElementById('menurun-list');
    
    mendatarList.innerHTML = '';
    menurunList.innerHTML = '';

    currentData.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.no}.</strong> ${item.clue}`;
        
        if (item.arah === "mendatar") {
            mendatarList.appendChild(li);
        } else {
            menurunList.appendChild(li);
        }
    });
}

// 4. Fungsi Cek Jawaban
function checkAnswers() {
    const inputs = document.querySelectorAll('.grid-cell input');
    let allCorrect = true;

    inputs.forEach(input => {
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        const userChar = input.value.toUpperCase();
        
        // Cari karakter asli di data
        let correctChar = "";
        currentData.forEach(item => {
            if (item.arah === "mendatar") {
                if (r === item.y && c >= item.x && c < item.x + item.jawaban.length) {
                    correctChar = item.jawaban[c - item.x];
                }
            } else {
                if (c === item.x && r >= item.y && r < item.y + item.jawaban.length) {
                    correctChar = item.jawaban[r - item.y];
                }
            }
        });

        if (userChar === correctChar) {
            input.parentElement.style.backgroundColor = "#d4edda"; // Hijau jika benar
        } else {
            input.parentElement.style.backgroundColor = "#f8d7da"; // Merah jika salah
            allCorrect = false;
        }
    });

    if (allCorrect) alert("Selamat! Jawaban kamu benar semua!");
}

// 5. Reset Game
function resetGame() {
    const inputs = document.querySelectorAll('.grid-cell input');
    inputs.forEach(input => {
        input.value = '';
        input.parentElement.style.backgroundColor = "white";
    });
}

// Muat tema biologi saat pertama kali dibuka
window.onload = () => loadCategory('biologi');
