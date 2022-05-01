/**
 * Pour cette page, j'utilise 2 librairies nécesaire :
 *  - THREE.JS => Lib qui permet de gerer la 3d dans un navigateur en utilisant le moteur de rendu WebGL.
 *  - TWEEN.JS => Lib qui permet calculer les positions dans le temps avec une fonction d'application type ease
 * 
 * Je conseil de lire character.js avant de lire ce ficher 
 * 
 * Certaines resources sont mises ailleurs car le navigateur bloque la lecteur si on n'utilise pas de serveur web
 * Les resources sont à l'adresse : https://kairrot.github.io/site-nsi/ où l'on peut retrouver le site en ligne
 */

const scrollInfo    = document.querySelector('.scrollInfo')

/* Affichage de l'indicateur de scroll en bas à droite */
var isScroll = false
setTimeout(() => {
    if(!isScroll) scrollInfo.style.display = 'unset';
}, 2500)

const loader = new THREE.GLTFLoader()

/**
 * Creation de la scene et de la camera => Voir character.js pour details d'init THREE.JS
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = -5
camera.rotation.y = Math.PI


/**
 * Creation du renderer avec son arrière plan => Voir character.js pour details d'init THREE.JS
 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x383838)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', e => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

/* Ajout des lumières */
const light = new THREE.AmbientLight(0xffffff, 1.8)
scene.add(light)

/* Shader qui permet de créer un arrière plan gradient */
var shader = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      color1: {
        value: new THREE.Color(0xE45826)
      },
      color2: {
        value: new THREE.Color(0xF0A500)
      }
    },
    vertexShader: `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
      }
    `,
  });
scene.add(new THREE.Mesh(new THREE.BoxGeometry(1000,1000,1000), shader))

const maxHeight = Math.tan((camera.fov / 2) * Math.PI / 180) * camera.position.z * -1;


/* Contante qui vont servir */
const numberOfPlane = 6
const distance = 2.5
const scrollMax = numberOfPlane**2 * 100

const center = new THREE.Group()

var rock = null;
/* Chargement de la roche au pied de Michael */
// Resource en ligne car bloquage navigateur
loader.setPath('https://kairrot.github.io/site-nsi/assets/rock/')
loader.load('scene.gltf', gltf => {
    rock = gltf.scene;
    rock.scale.set(0.02,0.02,0.02)
    rock.rotation.y = Math.PI
    rock.rotation.x = Math.PI
    rock.position.y = -2.87
    rock.position.x = 0.5

    center.add(rock)
})

var centerStatue = null;
/* Chargement de Michael */
// Resource en ligne car bloquage navigateur
loader.setPath('https://kairrot.github.io/site-nsi/assets/scofield/')
loader.load('test.gltf', gltf => {
    centerStatue = gltf.scene
    centerStatue.rotation.y = Math.PI
    
    centerStatue.scale.set(5.5,5.5,5.5)
    
    center.add(centerStatue)
})
scene.add(center)


/* Groupe qui va contenir les sliders autour de Michael */
const infos = new THREE.Group()
const infosArray = []

const geometry = new THREE.PlaneBufferGeometry(2,1.125);
const relativeAngle = (Math.PI / 3)

function addBanner(i) {
  return new Promise(async resolve => {
    /* Chargement de la texture associé au slider */
    // Resource en ligne car bloquage navigateur
    new THREE.TextureLoader().load(`https://kairrot.github.io/site-nsi/assets/images/banner${numberOfPlane + 1 - i}.png`, texture => {
      const materialFront = new THREE.MeshBasicMaterial({map: texture, transparent: true });
      
      const info = new THREE.Mesh(geometry, materialFront)
  
      /* Calcul des coordonnées en utilisant les coordonnées polaires */
      const absoluteAngle = (relativeAngle * i) - (Math.PI / 2)
  
      info.position.x = Math.cos(absoluteAngle) * distance
      info.position.z = Math.sin(absoluteAngle) * distance
      
      info.position.y = i * 2.5
  
      info.rotation.y = (3 * Math.PI / 2) - absoluteAngle + (Math.PI)
      infos.add(info)
      infosArray.push(info)

      resolve()
    })
  })
}

/* Chargement des banières asyncrome */
async function loadBanner() {
  for (var i = 1; i <= numberOfPlane; i++) {
    await addBanner(i)
  }
}
loadBanner()

infos.position.y = -numberOfPlane * 2.5
scene.add(infos)

/* Evenement lié au scroll */
var scroll = {amount: 0}
var tween = null
window.addEventListener('wheel', e => {

    isScroll = true
    scrollInfo.style.display = 'none'

    if(tween) {
        tween.stop()
        TWEEN.remove(tween)
        tween = null;

        scroll.amount
    }

    /* Utilisation de TWEEN.JS pour rendre fluide le déplacement */
    tween = new TWEEN.Tween(scroll)
        .to({amount: ((Math.abs(e.deltaY) <= 10) ? e.deltaY * 15 : e.deltaY) + scroll.amount}, 250)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
})

function loop(time) {
    requestAnimationFrame(loop)

    TWEEN.update(time)
    renderer.render(scene, camera)

    /* SCROLL */
    const scrollAbsolute = (scroll.amount / scrollMax)
    const scrollRotation =  scrollAbsolute * (Math.PI * 2) * 0.5

    center.rotation.y = scrollRotation
    center.position.y = (maxHeight - 2) * (scrollAbsolute - 0.5) - 1.5

    infos.rotation.y = -scrollRotation * 2
    infos.position.y = (-numberOfPlane * 2.5) + scrollAbsolute * 2.5 * numberOfPlane
    /* SCROLL */
}
loop(0)