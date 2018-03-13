var section = document.getElementById('overlay')
var button = document.getElementById('test')
button.addEventListener('click', function() { 
    section.classList.toggle('hide')
    console.log('test')
})