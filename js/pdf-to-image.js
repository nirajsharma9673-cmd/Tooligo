var loadedPdfDoc = null;
var totalPdfPages = 0;
var convertedBlobs = [];

function handleFileSelect(files) {
    clearError();
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('preview-grid').innerHTML = '';
    document.getElementById('result-message').textContent = '';
    document.getElementById('convert-btn').disabled = true;
    convertedBlobs = [];

    if (!files || files.length === 0) return;

    var file = files[0];
    if (file.type !== 'application/pdf') {
        showError('Please select a valid PDF file.');
        return;
    }

    checkFileSize(file);
    showProgress('Loading PDF...');

    setTimeout(function() {
        loadPdfFile(file);
    }, 50);
}

async function loadPdfFile(file) {
    try {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library not loaded. Please check your internet connection.');
        }

        var arrayBuffer = await file.arrayBuffer();
        var loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        loadedPdfDoc = await loadingTask.promise;
        totalPdfPages = loadedPdfDoc.numPages;

        hideProgress();

        document.getElementById('file-info').textContent =
            escapeHtml(file.name) + ' — ' + totalPdfPages + ' page' + (totalPdfPages !== 1 ? 's' : '');
        document.getElementById('file-info-area').style.display = 'block';
        document.getElementById('convert-controls').style.display = 'block';
        document.getElementById('convert-btn').disabled = false;

    } catch (err) {
        hideProgress();
        var msg = 'Could not load this PDF. ';
        if (err.message && (
            err.message.toLowerCase().indexOf('password') !== -1 ||
            err.message.toLowerCase().indexOf('encrypt') !== -1
        )) {
            msg += 'It appears to be password-protected or encrypted.';
        } else if (err.message && err.message.toLowerCase().indexOf('corrupt') !== -1) {
            msg += 'The file appears to be corrupted.';
        } else {
            msg += err.message || 'Unknown error.';
        }
        showError(msg);
        loadedPdfDoc = null;
    }
}

async function convertPdfToImages() {
    clearError();
    if (!loadedPdfDoc || totalPdfPages === 0) {
        showError('Please load a PDF file first.');
        return;
    }

    var format = document.getElementById('image-format').value;
    var quality = parseFloat(document.getElementById('image-quality').value);
    var renderScale = quality >= 0.9 ? 2.0 : 1.5;

    document.getElementById('convert-btn').disabled = true;
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('preview-grid').innerHTML = '';
    convertedBlobs = [];

    showProgress('Starting conversion...');

    setTimeout(function() {
        performConversion(format, quality, renderScale);
    }, 50);
}

async function performConversion(format, quality, renderScale) {
    try {
        var mimeType = 'image/' + (format === 'jpeg' ? 'jpeg' : 'png');
        var ext = format === 'jpeg' ? 'jpg' : 'png';
        var previewGrid = document.getElementById('preview-grid');
        var resultSection = document.getElementById('result-section');

        for (var i = 1; i <= totalPdfPages; i++) {
            showProgress('Converting page ' + i + ' of ' + totalPdfPages + '...');

            var page = await loadedPdfDoc.getPage(i);
            var viewport = page.getViewport({ scale: renderScale });

            var canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            var ctx = canvas.getContext('2d');

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            var blob = await new Promise(function(resolve, reject) {
                canvas.toBlob(function(b) {
                    if (b) resolve(b);
                    else reject(new Error('Failed to create image from page ' + i));
                }, mimeType, quality);
            });

            convertedBlobs.push(blob);

            var card = document.createElement('div');
            card.className = 'preview-card';

            var img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            img.alt = 'Page ' + i;

            var label = document.createElement('div');
            label.className = 'page-label';
            label.textContent = 'Page ' + i;

            card.appendChild(img);
            card.appendChild(label);
            previewGrid.appendChild(card);
        }

        hideProgress();

        resultSection.style.display = 'block';
        document.getElementById('result-message').textContent =
            'Converted ' + totalPdfPages + ' page' + (totalPdfPages !== 1 ? 's' : '') +
            ' to ' + format.toUpperCase() + '. Preview thumbnails shown above.';

        document.getElementById('convert-btn').disabled = false;

    } catch (err) {
        hideProgress();
        showError('Conversion failed: ' + (err.message || 'Unknown error'));
        document.getElementById('convert-btn').disabled = false;
    }
}

function downloadAllAsZip() {
    if (convertedBlobs.length === 0) {
        showError('No images to download. Please convert the PDF first.');
        return;
    }

    if (typeof JSZip === 'undefined') {
        showError('JSZip library not loaded. Please check your internet connection.');
        return;
    }

    var format = document.getElementById('image-format').value;
    var ext = format === 'jpeg' ? 'jpg' : 'png';
    var zip = new JSZip();

    for (var i = 0; i < convertedBlobs.length; i++) {
        zip.file('page-' + (i + 1) + '.' + ext, convertedBlobs[i]);
    }

    showProgress('Creating ZIP archive...');

    zip.generateAsync({ type: 'uint8array' }).then(function(content) {
        hideProgress();
        downloadBlob(content, 'pdf-images.zip', 'application/zip');
    }).catch(function(err) {
        hideProgress();
        showError('Failed to create ZIP: ' + (err.message || 'Unknown error'));
    });
}

function clearAll() {
    loadedPdfDoc = null;
    totalPdfPages = 0;
    convertedBlobs = [];
    document.getElementById('file-input').value = '';
    document.getElementById('file-info-area').style.display = 'none';
    document.getElementById('convert-controls').style.display = 'none';
    document.getElementById('convert-btn').disabled = true;
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('preview-grid').innerHTML = '';
    document.getElementById('result-message').textContent = '';
    document.getElementById('size-warning').style.display = 'none';
    clearError();
}