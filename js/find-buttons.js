const http = require('http');

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('=== ANALYZING SERVER RESPONSE ===\n');

        // Count all buttons
        const allButtons = data.match(/<button/g);
        console.log(`Total <button> tags: ${allButtons ? allButtons.length : 0}\n`);

        // Find auth-button
        const authButtons = data.match(/class="auth-button"/g);
        console.log(`Auth buttons: ${authButtons ? authButtons.length : 0}`);

        // Find upload-button
        const uploadButtons = data.match(/class="upload-button"/g);
        console.log(`Upload buttons: ${uploadButtons ? uploadButtons.length : 0}\n`);

        // Find button with "选择文件" text
        const selectFileButtons = data.match(/选择文件/g);
        console.log(`Buttons with "选择文件" text: ${selectFileButtons ? selectFileButtons.length : 0}\n`);

        // Find button with "登录" text
        const loginButtons = data.match(/登录/g);
        console.log(`Buttons with "登录" text: ${loginButtons ? loginButtons.length : 0}\n`);

        // Extract all button HTML
        console.log('=== ALL BUTTONS FOUND ===\n');
        const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/g;
        let match;
        let buttonIndex = 1;
        while ((match = buttonRegex.exec(data)) !== null) {
            console.log(`Button ${buttonIndex}:`);
            console.log(match[0]);
            console.log();
            buttonIndex++;
        }

        // Check auth container
        const authContainerHidden = data.includes('style="display: none;"') && data.includes('authContainer');
        console.log(`Auth container hidden: ${authContainerHidden}`);
    });
});

req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
    console.error('Make sure server is running on port 8080');
});

req.end();
