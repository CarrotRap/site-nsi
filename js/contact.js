const validBtn      = document.querySelector('.valid');
const email         = document.querySelector('.email');
const description   = document.querySelector('.description');
const contact       = document.querySelector('.content');
const info          = document.querySelector('.info');

validBtn.addEventListener('click', () => {
    info.innerHTML = 'Envoie en cours'
    let i = 0;
    const interval = setInterval(() => {
        if(i >= 3) {
            clearInterval(interval)

            contact.classList.add('easteregg')

            info.innerHTML = ''
        } else {
            info.innerHTML += '.'
            i++
        }
    }, 800)
})