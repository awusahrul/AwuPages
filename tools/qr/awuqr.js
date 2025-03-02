
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const qrCanvas = document.getElementById('qr-canvas');
        const scanOutput = document.getElementById('scan-output');
        const uploadOutput = document.getElementById('upload-output');
        const copyButton = document.getElementById('copy-button');
        const downloadButton = document.getElementById('download-button');
        const flashlightButton = document.getElementById('flashlight-button');
        const qrInput = document.getElementById('qr-input');
        const qrOutput = document.getElementById('qr-output');
        const scanOutputContainer = scanOutput.parentElement;
        const uploadOutputContainer = uploadOutput.parentElement;
        const ctx = canvas.getContext('2d');
        let stream = null;
        let lastResult = '';
        let flashlightOn = false;
        let videoTrack = null;

        // Tab handling
        const scanTabButton = document.getElementById('scan-tab-button');
        const uploadTabButton = document.getElementById('upload-tab-button');
        const generateTabButton = document.getElementById('generate-tab-button');
        const scanTab = document.getElementById('scan-tab');
        const uploadTab = document.getElementById('upload-tab');
        const generateTab = document.getElementById('generate-tab');

        scanTabButton.addEventListener('click', () => {
            scanTabButton.classList.add('active');
            uploadTabButton.classList.remove('active');
            generateTabButton.classList.remove('active');
            scanTab.classList.add('active');
            uploadTab.classList.remove('active');
            generateTab.classList.remove('active');
            startCamera();
            scanOutput.style.display = 'none';
            uploadOutputContainer.removeChild(copyButton);
            scanOutputContainer.appendChild(copyButton);
            copyButton.style.display = 'none';
        });

        uploadTabButton.addEventListener('click', () => {
            uploadTabButton.classList.add('active');
            scanTabButton.classList.remove('active');
            generateTabButton.classList.remove('active');
            uploadTab.classList.add('active');
            scanTab.classList.remove('active');
            generateTab.classList.remove('active');
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            uploadOutput.style.display = 'none';
            scanOutputContainer.removeChild(copyButton);
            uploadOutputContainer.appendChild(copyButton);
            copyButton.style.display = 'none';
            flashlightButton.style.display = 'none';
        });

        generateTabButton.addEventListener('click', () => {
            generateTabButton.classList.add('active');
            scanTabButton.classList.remove('active');
            uploadTabButton.classList.remove('active');
            generateTab.classList.add('active');
            scanTab.classList.remove('active');
            uploadTab.classList.remove('active');
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            flashlightButton.style.display = 'none';
        });

        // Fungsi untuk memulai kamera
        function startCamera() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(videoStream => {
                    stream = videoStream;
                    video.srcObject = stream;
                    video.play();
                    videoTrack = stream.getVideoTracks()[0];
                    checkFlashlightSupport();
                    requestAnimationFrame(tick);
                })
                .catch(err => {
                    scanOutput.textContent = 'Error mengakses kamera: ' + err.message;
                    scanOutput.style.display = 'block';
                    copyButton.style.display = 'none';
                    flashlightButton.style.display = 'none';
                });
        }

        // Fungsi untuk memeriksa dukungan senter
        function checkFlashlightSupport() {
            if (videoTrack && 'applyConstraints' in videoTrack) {
                const capabilities = videoTrack.getCapabilities();
                if (capabilities.torch) {
                    flashlightButton.style.display = 'block';
                } else {
                    flashlightButton.style.display = 'none';
                    console.log('Senter tidak didukung pada perangkat ini');
                }
            }
        }

        // Fungsi untuk mengontrol senter
        function toggleFlashlight() {
            if (!videoTrack) return;

            flashlightOn = !flashlightOn;
            videoTrack.applyConstraints({
                advanced: [{ torch: flashlightOn }]
            }).then(() => {
                flashlightButton.textContent = flashlightOn ? 'Matikan Senter' : 'Nyalakan Senter';
            }).catch(err => {
                console.error('Gagal mengontrol senter:', err);
                scanOutput.textContent = 'Gagal mengontrol senter: ' + err.message;
                scanOutput.style.display = 'block';
                flashlightOn = !flashlightOn;
            });
        }

        // Loop pemindaian kamera
        function tick() {
            if (!scanTab.classList.contains('active')) return;
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    displayResult(code.data, scanOutput);
                }
            }
            requestAnimationFrame(tick);
        }

        // Fungsi untuk memindai gambar yang diunggah
        function scanUploadedImage(event) {
            const file = event.target.files[0];
            
            if (!file) {
                uploadOutput.textContent = 'Silakan pilih gambar terlebih dahulu';
                uploadOutput.style.display = 'block';
                copyButton.style.display = 'none';
                return;
            }

            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    displayResult(code.data, uploadOutput);
                } else {
                    uploadOutput.textContent = 'Tidak ada QR code yang ditemukan di gambar';
                    uploadOutput.style.display = 'block';
                    copyButton.style.display = 'none';
                }
            };
            img.src = URL.createObjectURL(file);
        }

        // Fungsi untuk menampilkan hasil scan
        function displayResult(data, outputElement) {
            lastResult = data;
            if (data.startsWith('http')) {
                outputElement.innerHTML = `<a href="${data}" target="_blank">${data}</a>`;
            } else {
                outputElement.textContent = data;
            }
            outputElement.style.display = 'block';
            copyButton.style.display = 'block';
        }

        // Fungsi untuk menyalin hasil
        function copyResult() {
            navigator.clipboard.writeText(lastResult)
                .then(() => {
                    copyButton.textContent = 'Tersalin!';
                    setTimeout(() => {
                        copyButton.textContent = 'Salin';
                    }, 2000);
                })
                .catch(err => {
                    alert('Gagal menyalin: ' + err);
                });
        }

        // Fungsi untuk membuat QR
        qrInput.addEventListener('input', () => {
            const text = qrInput.value.trim();
            qrOutput.innerHTML = ''; // Bersihkan konten sebelumnya
            if (text) {
                QRCode.toCanvas(qrCanvas, text, { width: 200, margin: 2 }, (error) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    qrOutput.appendChild(qrCanvas);
                    qrCanvas.style.display = 'block';
                    downloadButton.style.display = 'block';
                });
            } else {
                qrCanvas.style.display = 'none';
                downloadButton.style.display = 'none';
            }
        });

        // Fungsi untuk download QR
        function downloadQR() {
            QRCode.toDataURL(qrInput.value.trim(), { width: 200, margin: 2 }, (error, url) => {
                if (error) {
                    console.error(error);
                    return;
                }
                const link = document.createElement('a');
                link.href = url;
                link.download = 'qrcode.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }

        // Event listener untuk input file
        document.getElementById('imageUpload').addEventListener('change', scanUploadedImage);

        // Pindahkan copyButton ke scan-tab secara default
        scanOutputContainer.appendChild(copyButton);

        // Mulai kamera saat halaman dimuat
        startCamera();
