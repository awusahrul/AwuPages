export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { nama, email } = req.body;

    if (!nama || !email) {
        return res.status(400).json({ message: 'Nama dan email harus diisi!' });
    }

    const newEntry = { nama, email, timestamp: new Date().toISOString() };

    // GitHub API Config
    const GITHUB_TOKEN = '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';
    const REPO_OWNER = 'awusahrul'; // Ganti dengan username GitHub-mu
    const REPO_NAME = 'AwuPages'; // Ganti dengan nama repo GitHub-mu
    const FILE_PATH = '@cdn/respon.json'; // File tujuan

    try {
        // Ambil isi respon.json dari GitHub
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        const fileData = await response.json();
        const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

        // Tambahkan data baru
        content.push(newEntry);

        // Encode ke base64
        const updatedContent = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

        // Simpan ke GitHub
        await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update respon.json',
                content: updatedContent,
                sha: fileData.sha
            })
        });

        return res.status(200).json({ message: 'Data berhasil disimpan!' });
    } catch (error) {
        return res.status(500).json({ message: 'Gagal menyimpan data', error: error.message });
    }
}
