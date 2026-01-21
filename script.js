/**
 * script.js - Logika Utama GridPustaka
 */

// Konfigurasi ukuran grid (10x10 seperti kotak TTS standar)
const GRID_SIZE = 10;
let currentData = [];

/**
 * Fungsi untuk memuat kategori dari file JSON
 */
async function loadCategory(category) {
    const board = document.getElementById('tts-board');
    const currentTitle = document.getElementById('current-title');
    
    // Tampilkan loading sederhana
    currentTitle.innerText = "Memuat...";
    board.innerHTML = ""; 

    try {
        // Mengambil data dari folder /data/
        const response = await fetch(`./data/${category}.json`);
        if (!response.ok) throw new Error("File tidak ditemukan");
        
        const json = await response.json();
        currentData = json.data;
        
        renderGame(json);
    } catch (error) {
        console.error("Error:", error);
        currentTitle.innerText = "Gagal memuat tema.";
    }
}

/**
 * Fungsi untuk menggambar papan dan daftar pertanyaan
 */
function renderGame(json) {
    const board = document.getElementById('tts-board');
    const mendatarList = document.getElementById('mendatar-list');
    const menurunList = document.getElementById('menurun-list');
    const currentTitle = document.getElementById('current-title');

    // Update Judul Edisi
    currentTitle.innerText = json.edisi;

    // 1. Bersihkan kontainer
    board.innerHTML = "";
    mendatarList.innerHTML = "";
    menurunList.innerHTML = "";

    // 2. Buat grid dasar (100 kotak hitam)
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const row = Math.floor(i / GRID_SIZE);
        const col = i % GRID_SIZE;
        const cell = document.createElement('div');
        cell.className = 'cell black';
        cell.id = `cell-${row}-${col}`;
        board.appendChild(cell);
    }

    // 3. Isi grid dengan input berdasarkan data JSON
    json.data.forEach(item => {
        const { no, arah, x, y, jawaban, clue } = item;

        for (let i = 0; i < jawaban.length; i++) {
            // Hitung koordinat berdasarkan arah
            let r = arah === 'menurun' ? y + i : y;
            let c = arah === 'mendatar' ? x + i : x;

            const targetCell = document.getElementById(`cell-${r}-${c}`);
            
            if (targetCell) {
                // Ubah kotak hitam jadi putih (aktif)
                if (targetCell.classList.contains('black')) {
                    targetCell.classList.remove('black');
                    targetCell.innerHTML = `<input maxlength="1" data-ans="${jawaban[i].toUpperCase()}">`;
                }

                // Tambahkan nomor soal di awal kata
                if (i === 0) {
                    const span = document.createElement('span');
                    span.className = 'cell-num';
                    span.innerText = no;
                    targetCell.appendChild(span);
                }
            }
        }

        // 4. Tambahkan ke daftar pertanyaan samping
        const li = document.createElement('li');
        li.innerHTML = `<strong>${no}.</strong> ${clue}`;
        if (arah === 'mendatar') {
            mendatarList.appendChild(li);
        } else {
            menurunList.appendChild(li);
        }
    });

    // Tambahkan event listener otomatis pindah kotak (Auto-focus)
    setupAutofocus();
}

/**
 * Fungsi untuk memeriksa jawaban (Tombol Cek Jawaban)
 */
function checkAnswers() {
    const inputs = document.querySelectorAll('.cell input');
    inputs.forEach(input => {
        const userAns = input.value.toUpperCase();
        const correctAns = input.getAttribute('data-ans');

        if (userAns === "") {
            input.parentElement.classList.remove('is-correct', 'is-wrong');
        } else if (userAns === correctAns) {
            input.parentElement.classList.add('is-correct');
            input.parentElement.classList.remove('is-wrong');
        } else {
            input.parentElement.classList.add('is-wrong');
            input.parentElement.classList.remove('is-correct');
        }
    });
}

/**
 * Fitur agar setelah mengetik 1 huruf, kursor pindah ke kotak berikutnya
 */
function setupAutofocus() {
    const inputs = document.querySelectorAll('.cell input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
    });
}

/**
 * Fungsi reset game
 */
function resetGame() {
    const inputs = document.querySelectorAll('.cell input');
    inputs.forEach(input => {
        input.value = "";
        input.parentElement.classList.remove('is-correct', 'is-wrong');
    });
}

// Jalankan tema Biologi secara otomatis saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadCategory('biologi');
});
