function countWords() {
    const text = document.getElementById('text-input').value;

    const words = text.trim() ? text.trim().split(/\s+/).filter(function(w) { return w.length > 0; }) : [];
    const charsWithSpaces = text.length;
    const charsWithoutSpaces = text.replace(/\s/g, '').length;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(function(s) { return s.trim().length > 0; }) : [];
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(function(p) { return p.trim().length > 0; }) : [];
    const wordCount = words.length;
    const readingTime = wordCount === 0 ? '< 1 min' : Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

    document.getElementById('word-count').textContent = wordCount.toLocaleString();
    document.getElementById('char-with-spaces').textContent = charsWithSpaces.toLocaleString();
    document.getElementById('char-no-spaces').textContent = charsWithoutSpaces.toLocaleString();
    document.getElementById('sentence-count').textContent = sentences.length.toLocaleString();
    document.getElementById('paragraph-count').textContent = paragraphs.length.toLocaleString();
    document.getElementById('reading-time').textContent = readingTime;
}

function resetCounter() {
    document.getElementById('text-input').value = '';
    countWords();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('text-input').addEventListener('input', countWords);
    countWords();
});
