var loadedFile = null;
var loadedPdfDoc = null;
var totalPages = 0;

function handleFileSelect(files) {
    clearError();
    var errorMsg = document.getElementById('error-message');
    errorMsg.textContent = '';
    errorMsg.classList.remove('show');
    document.getElementById('result-section').classList.remove('show');

    if (!files || files.length === 0) return;

    var file = files[0];
    if (file.type !== 'application/pdf') {
        showError('Please select a valid PDF file.');
        return;
    }

    checkFileSize(file);
    loadedFile = file;
    loadedPdfDoc = null;
    totalPages = 0;

    showProgress('Loading PDF...');

    setTimeout(function() {
        loadPdfFile(file);
    }, 50);
}

async function loadPdfFile(file) {
    try {
        if (typeof PDFLib === 'undefined') {
            throw new Error('PDF library not loaded. Please check your internet connection.');
        }

        var arrayBuffer = await file.arrayBuffer();
        loadedPdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        totalPages = loadedPdfDoc.getPageCount();

        hideProgress();

        document.getElementById('file-info').textContent =
            escapeHtml(file.name) + ' — ' + totalPages + ' page' + (totalPages !== 1 ? 's' : '');
        document.getElementById('file-info-area').style.display = 'block';
        document.getElementById('split-controls').style.display = 'block';
        document.getElementById('extract-btn').disabled = false;
        document.getElementById('split-all-btn').disabled = false;

    } catch (err) {
        hideProgress();
        var msg = 'Could not load this PDF. ';
        if (err.message && err.message.toLowerCase().indexOf('encrypt') !== -1) {
            msg += 'It appears to be password-protected or encrypted.';
        } else if (err.message && err.message.toLowerCase().indexOf('corrupt') !== -1) {
            msg += 'The file appears to be corrupted.';
        } else {
            msg += err.message || 'Unknown error.';
        }
        showError(msg);
        loadedFile = null;
        loadedPdfDoc = null;
    }
}

function switchMode(mode) {
    document.getElementById('range-input-area').style.display =
        (mode === 'range') ? 'block' : 'none';
    document.querySelectorAll('.mode-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.mode === mode);
    });
}

function extractRange() {
    clearError();
    if (!loadedPdfDoc) {
        showError('Please load a PDF file first.');
        return;
    }

    var rangeInput = document.getElementById('page-range').value.trim();
    if (!rangeInput) {
        showError('Please enter a page range (e.g. 1-3).');
        return;
    }

    var range = parseRange(rangeInput, totalPages);
    if (!range) {
        showError('Invalid range. Please use format like "1-3" or "1,3,5". Pages must be between 1 and ' + totalPages + '.');
        return;
    }

    showProgress('Extracting pages...');
    document.getElementById('extract-btn').disabled = true;

    setTimeout(function() {
        performExtract(range);
    }, 50);
}

async function performExtract(pageNumbers) {
    try {
        var newPdf = await PDFLib.PDFDocument.create();
        var pageIndices = pageNumbers.map(function(p) { return p - 1; });
        var copiedPages = await newPdf.copyPages(loadedPdfDoc, pageIndices);
        for (var i = 0; i < copiedPages.length; i++) {
            newPdf.addPage(copiedPages[i]);
        }

        var pdfBytes = await newPdf.save();
        downloadBlob(pdfBytes, 'extracted-pages.pdf', 'application/pdf');

        hideProgress();
        document.getElementById('extract-btn').disabled = false;

        document.getElementById('result-section').classList.add('show');
        document.getElementById('result-message').textContent =
            'Extracted ' + pageNumbers.length + ' page' + (pageNumbers.length !== 1 ? 's' : '') + ' successfully.';

    } catch (err) {
        showError('Extraction failed: ' + (err.message || 'Unknown error'));
        hideProgress();
        document.getElementById('extract-btn').disabled = false;
    }
}

function splitAll() {
    clearError();
    if (!loadedPdfDoc) {
        showError('Please load a PDF file first.');
        return;
    }

    if (totalPages === 0) {
        showError('No pages found in the PDF.');
        return;
    }

    showProgress('Splitting ' + totalPages + ' page' + (totalPages !== 1 ? 's' : '') + ' into individual files...');
    document.getElementById('split-all-btn').disabled = true;

    setTimeout(function() {
        performSplitAll();
    }, 50);
}

async function performSplitAll() {
    try {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library not loaded. Please check your internet connection.');
        }

        var zip = new JSZip();

        for (var i = 0; i < totalPages; i++) {
            showProgress('Creating page ' + (i + 1) + ' of ' + totalPages + '...');

            var pagePdf = await PDFLib.PDFDocument.create();
            var copiedPages = await pagePdf.copyPages(loadedPdfDoc, [i]);
            pagePdf.addPage(copiedPages[0]);
            var pdfBytes = await pagePdf.save();

            zip.file('page-' + (i + 1) + '.pdf', pdfBytes);
        }

        showProgress('Creating ZIP archive...');
        var zipContent = await zip.generateAsync({ type: 'uint8array' });
        downloadBlob(zipContent, 'split-pages.zip', 'application/zip');

        hideProgress();
        document.getElementById('split-all-btn').disabled = false;

        document.getElementById('result-section').classList.add('show');
        document.getElementById('result-message').textContent =
            'Split ' + totalPages + ' page' + (totalPages !== 1 ? 's' : '') + ' into individual PDF files.';

    } catch (err) {
        showError('Split failed: ' + (err.message || 'Unknown error'));
        hideProgress();
        document.getElementById('split-all-btn').disabled = false;
    }
}

function parseRange(input, maxPage) {
    var pages = [];
    var parts = input.split(',');

    for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        var rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (rangeMatch) {
            var start = parseInt(rangeMatch[1], 10);
            var end = parseInt(rangeMatch[2], 10);
            if (start < 1 || start > maxPage || end < 1 || end > maxPage || start > end) {
                return null;
            }
            for (var p = start; p <= end; p++) {
                if (pages.indexOf(p) === -1) pages.push(p);
            }
        } else {
            var single = parseInt(part, 10);
            if (isNaN(single) || single < 1 || single > maxPage) {
                return null;
            }
            if (pages.indexOf(single) === -1) pages.push(single);
        }
    }
    return pages.length > 0 ? pages.sort(function(a,b){return a-b;}) : null;
}

function clearAll() {
    loadedFile = null;
    loadedPdfDoc = null;
    totalPages = 0;
    document.getElementById('file-input').value = '';
    document.getElementById('file-info-area').style.display = 'none';
    document.getElementById('split-controls').style.display = 'none';
    document.getElementById('page-range').value = '';
    document.getElementById('result-section').classList.remove('show');
    document.getElementById('size-warning').style.display = 'none';
    clearError();
}


