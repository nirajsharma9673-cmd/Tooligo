var fileList = [];

function handleFileSelect(files) {
    var list = document.getElementById('file-list');
    var mergeBtn = document.getElementById('merge-btn');
    var errorMsg = document.getElementById('error-message');
    errorMsg.textContent = '';
    errorMsg.classList.remove('show');

    for (var i = 0; i < files.length; i++) {
        if (files[i].type !== 'application/pdf') {
            showError(files[i].name + ' is not a PDF file and was skipped.');
            continue;
        }
        fileList.push({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            file: files[i],
            name: files[i].name,
            size: files[i].size
        });
    }

    renderFileList();
    if (fileList.length >= 2) {
        mergeBtn.disabled = false;
    }
}

function renderFileList() {
    var list = document.getElementById('file-list');
    var statusMsg = document.getElementById('file-status');
    list.innerHTML = '';

    if (fileList.length === 0) {
        statusMsg.textContent = 'No files selected';
        document.getElementById('merge-btn').disabled = true;
        return;
    }

    statusMsg.textContent = fileList.length + ' file' + (fileList.length !== 1 ? 's' : '') + ' selected';

    for (var i = 0; i < fileList.length; i++) {
        var item = fileList[i];
        var sizeText = formatFileSize(item.size);
        var div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML =
            '<span class="file-item-index">' + (i + 1) + '.</span>' +
            '<span class="file-item-name">' + escapeHtml(item.name) + ' <span class="file-item-size">(' + sizeText + ')</span></span>' +
            '<span class="file-item-actions">' +
                (i > 0 ? '<button class="btn-small" onclick="moveFile(' + i + ', -1)" title="Move up">&uarr;</button>' : '') +
                (i < fileList.length - 1 ? '<button class="btn-small" onclick="moveFile(' + i + ', 1)" title="Move down">&darr;</button>' : '') +
                '<button class="btn-small btn-remove" onclick="removeFile(' + i + ')" title="Remove">&times;</button>' +
            '</span>';
        list.appendChild(div);
    }
}

function moveFile(index, direction) {
    var target = index + direction;
    if (target < 0 || target >= fileList.length) return;
    var temp = fileList[index];
    fileList[index] = fileList[target];
    fileList[target] = temp;
    renderFileList();
}

function removeFile(index) {
    fileList.splice(index, 1);
    renderFileList();
    if (fileList.length < 2) {
        document.getElementById('merge-btn').disabled = true;
    }
}

function clearFiles() {
    fileList = [];
    document.getElementById('file-input').value = '';
    renderFileList();
    document.getElementById('merge-btn').disabled = true;
    document.getElementById('result-section').classList.remove('show');
}

function startMerge() {
    var errorMsg = document.getElementById('error-message');
    errorMsg.textContent = '';
    errorMsg.classList.remove('show');

    if (fileList.length < 2) {
        showError('Please select at least 2 PDF files to merge.');
        return;
    }

    showProgress('Loading PDF files...');
    document.getElementById('merge-btn').disabled = true;

    setTimeout(function() {
        performMerge();
    }, 50);
}

async function performMerge() {
    try {
        if (typeof PDFLib === 'undefined') {
            throw new Error('PDF library not loaded. Please check your internet connection.');
        }

        var mergedPdf = await PDFLib.PDFDocument.create();

        for (var i = 0; i < fileList.length; i++) {
            showProgress('Processing file ' + (i + 1) + ' of ' + fileList.length + ': ' + fileList[i].name + '...');

            try {
                var arrayBuffer = await fileList[i].file.arrayBuffer();
                var pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                var pageIndices = pdfDoc.getPageIndices();
                var copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
                for (var j = 0; j < copiedPages.length; j++) {
                    mergedPdf.addPage(copiedPages[j]);
                }
            } catch (loadErr) {
                var msg = 'Could not process "' + fileList[i].name + '". ';
                if (loadErr.message && loadErr.message.toLowerCase().indexOf('encrypt') !== -1) {
                    msg += 'It appears to be password-protected or encrypted.';
                } else if (loadErr.message && loadErr.message.toLowerCase().indexOf('corrupt') !== -1) {
                    msg += 'The file appears to be corrupted.';
                } else {
                    msg += loadErr.message || 'Unknown error.';
                }
                showError(msg);
                hideProgress();
                document.getElementById('merge-btn').disabled = false;
                return;
            }
        }

        showProgress('Saving merged PDF...');
        var pdfBytes = await mergedPdf.save();

        downloadBlob(pdfBytes, 'merged.pdf', 'application/pdf');
        hideProgress();
        document.getElementById('merge-btn').disabled = false;

        document.getElementById('result-section').classList.add('show');
        document.getElementById('result-message').textContent =
            'Successfully merged ' + fileList.length + ' file' + (fileList.length !== 1 ? 's' : '') +
            ' (' + mergedPdf.getPageCount() + ' total pages).';

    } catch (err) {
        showError('Merge failed: ' + (err.message || 'Unknown error'));
        hideProgress();
        document.getElementById('merge-btn').disabled = false;
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function checkFileSize(file) {
    if (file.size > 20 * 1024 * 1024) {
        document.getElementById('size-warning').style.display = 'block';
    } else {
        document.getElementById('size-warning').style.display = 'none';
    }
}
