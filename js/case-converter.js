function convertCase(type) {
    const textarea = document.getElementById('text-input');
    const text = textarea.value;

    switch (type) {
        case 'upper':
            textarea.value = text.toUpperCase();
            break;
        case 'lower':
            textarea.value = text.toLowerCase();
            break;
        case 'title':
            textarea.value = text.replace(/\w\S*/g, function(w) {
                return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
            });
            break;
        case 'sentence':
            textarea.value = text.replace(/(^\s*\w|[.!?]\s*\w)/g, function(c) {
                return c.toUpperCase();
            }).replace(/[A-Z]/g, function(c, i) {
                return i === 0 ? c : c.toLowerCase();
            });
            break;
        case 'alternating':
            textarea.value = text.split('').map(function(c, i) {
                return i % 2 === 0 ? c.toUpperCase() : c.toLowerCase();
            }).join('');
            break;
    }
}

function copyText() {
    const textarea = document.getElementById('text-input');
    const btn = document.getElementById('copy-btn');
    navigator.clipboard.writeText(textarea.value).then(function() {
        btn.textContent = 'Copied!';
        setTimeout(function() {
            btn.textContent = 'Copy to Clipboard';
        }, 2000);
    }).catch(function(err) {
        showError('Failed to copy text' + (err ? ': ' + err.message : ''));
    });
}

function resetCase() {
    document.getElementById('text-input').value = '';
}
