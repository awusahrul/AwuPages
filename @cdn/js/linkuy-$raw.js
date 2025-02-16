function isValidUrl(url) {
            try {
                let parsedUrl = new URL(url);
                return (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") &&
                       url.includes('.') && url.includes('/') && (url.startsWith('http://') || url.startsWith('https://'));
            } catch (e) {
                return false;
            }
        }

        async function shortenUrl() {
            const longUrl = document.getElementById('longUrl').value.trim();
            const alertBox = document.getElementById('alert');
            
            if (!isValidUrl(longUrl)) {
                alertBox.textContent = 'Masukkan URL yang valid!';
                alertBox.className = 'alert alert-error';
                alertBox.style.display = 'block';
                return;
            }

            const apiKey = 'pk_ywMeKp3H8Rvm4OuG'; 
            const domain = 'linkuy.eu.org'; 
            
            try {
                const response = await fetch('https://api.short.io/links/public', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': apiKey
                    },
                    body: JSON.stringify({ domain, originalURL: longUrl })
                });
                
                const data = await response.json();
                if (response.ok) {
                    document.getElementById('shortLink').textContent = data.shortURL;
                    document.getElementById('shortLink').style.display = 'block';
                    document.getElementById('copyBtn').style.display = 'block';
                    document.getElementById('openBtn').style.display = 'block';
                    alertBox.textContent = 'Short link berhasil dibuat!';
                    alertBox.className = 'alert alert-success';
                    alertBox.style.display = 'block';
                } else {
                    alertBox.textContent = 'Gagal membuat short link: ' + data.message;
                    alertBox.className = 'alert alert-error';
                    alertBox.style.display = 'block';
                }
            } catch (error) {
                alertBox.textContent = 'Terjadi kesalahan!';
                alertBox.className = 'alert alert-error';
                alertBox.style.display = 'block';
            }
        }

        function copyToClipboard() {
            navigator.clipboard.writeText(document.getElementById('shortLink').textContent);
            alert('Link disalin ke clipboard!');
        }

        function openShortLink() {
            window.open(document.getElementById('shortLink').textContent, '_blank');
        }
