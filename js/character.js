/**
 * Pour cette page, j'utilise 2 librairies nécesaire :
 *  - THREE.JS => Lib qui permet de gerer la 3d dans un navigateur en utilisant le moteur de rendu WebGL.
 *  - CANNON.JS => Lib qui permet de simuler de la physique en 3d (gravité, force, etc..)
 * 
 * Certaines resources sont mises ailleurs car le navigateur bloque la lecteur si on n'utilise pas de serveur web
 * Les resources sont à l'adresse : https://kairrot.github.io/site-nsi/ où l'on peut retrouver le site en ligne
 */

class Scene {

    distance = 15

    constructor() {
        this.container = document.querySelector('canvas')

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.setup();
    }

    /**
     * Dans cette fonction, il y a:
     *  - La creation d'un monde CANNON et la mise en place de la gravité dans ce monde
     *  - La creation de la scene 3d THREE.JS et de son brouillard
     *  - La creation d'un timer pour gerer l'animation
     *  - Toutes les fonctions d'initialisation (camera, objets, rendu 3d, lumière)
     *  - Le mise a niveau de la taille si le navigateur est resize
     */
    setup() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -50, 0);

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x312929, -1, 100);
        
        this.clock = new THREE.Clock();

        this.oldTime = 0

        this.setCamera();
        this.setLights();
        this.setRender();

        this.addObjects()

        window.addEventListener('resize', e => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.camera.aspect = this.width / this.height

            this.camera.top    = this.distance
            this.camera.right  = this.distance * this.camera.aspect
            this.camera.bottom = -this.distance
            this.camera.left   = -this.distance * this.camera.aspect
    
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(this.width, this.height);
        })
    }

    /**
     * Creation de la camera en utilisant l'aspet de la fenetre
     * Position de la camera mise ainsi que son angle de vue
     */
    setCamera() {
        const aspect = window.innerWidth / window.innerHeight;

        this.camera = new THREE.OrthographicCamera(-this.distance * aspect, this.distance * aspect, this.distance, -this.distance, -1, 100);

        this.camera.position.set(-10, 10, 10)
        this.camera.lookAt(new THREE.Vector3())
    }

    /**
     * Creation du moteur de rendu en utilisant un canvas
     * Arrière plan en #312929
     * Creation de la boucle d'animation à 60FPS => "this.draw()"
     */
    setRender() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: document.querySelector('canvas')
        })

        this.renderer.setClearColor(0x312929);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    
        this.renderer.shadowMap.enabled = true;

        this.renderer.setAnimationLoop(() => {
            this.draw()
        })
    }

    /* Mise en place des lumières */
    setLights() {
        const ambientLight = new THREE.AmbientLight(0xcccccc);
        this.scene.add(ambientLight);
    
        const foreLight = new THREE.DirectionalLight(0xffffff, 0.5);
        foreLight.position.set(5, 5, 20);
        this.scene.add(foreLight);
    
        const backLight = new THREE.DirectionalLight(0xffffff, 1);
        backLight.position.set(-5, -5, -10);
        this.scene.add(backLight);
      }

      /* Ajout des objets dans le menu */
    addObjects() {
        this.menu = new Menu(this.scene, this.world, this.camera, this.renderer.domElement)
    }

    /**
     * Boucle à 60FPS
     * Rendu à l'objet this.renderer de la scene avec la caméra
     */
    draw() {
        this.menu.update()
        this.world.step(1 / 60)

        this.renderer.render(this.scene, this.camera);

        this.oldTime = this.clock.getElapsedTime()
    }
}

class Menu {

    margin = 6;
    totalMass = 1;
    force = 25;

    /**
     * Chargement de la police en ligne
     * Ajout des evenement de click et de déplacement de souris
     */
    constructor(scene, world, camera, canvas) {
        this.navItems = document.querySelectorAll('.navigation a');

        this.scene = scene;
        this.world = world;
        this.camera = camera;
        this.canvas = canvas

        this.offset = this.navItems.length * this.margin * 0.5
        
        this.words = [];

        // Resource en ligne car bloquage navigateur
        new THREE.FontLoader().load('https://kairrot.github.io/site-nsi/assets/font/droid.json', font => {
            this.setup(font)
        })

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.canvas.addEventListener('click', () => { this.onClick() });
        window.addEventListener('mousemove', (e) => { this.onMouseMouve(e) })
    }

    /**
     * Le but de cette fonction est de détecter les clics sur un élément en utilisant un raycaster
     * puis de lui appliquer une force pour l'expluser
     * puis retirer tout les sols pour que les objets soit tiré vers le bas (gravité)
     */
    onClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera)

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if(intersects.length > 0) {
            const obj = intersects[0];
            const { object, face } = obj;

            if(!object.isMesh) return;

            const impulse = new THREE.Vector3()
                .copy(face.normal)
                .negate()
                .multiplyScalar(this.force);

            this.words.forEach((word, i) => {
                word.children.forEach(letter => {
                    const { body } = letter;

                    if(letter !== object) return;

                    body.applyLocalImpulse(impulse, new CANNON.Vec3())

                    function click(index, length) {
                        setTimeout(() => {
                            document.querySelector('a.item' + (length - index - 1)).click()
                        }, 1500)
                    }
                    click(i, this.words.length)

                    this.words.forEach(word => {
                        setTimeout(() => {
                            this.world.removeBody(word.ground)
                        }, 150)
                    })
                })
            })
        }
    }
    /* Changement du vecteur de la position de la souris */
    onMouseMouve(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    setup(f) {
        // Options d'extrudation des textes
        const textOptions = {
            font: f,
            size: 3,
            height: 0.4,
            curveSegments: 24,
            bevelEnabled: true,
            bevelThickness: 0.9,
            bevelSize: 0.3,
            bevelOffset: 0,
            bevelSegments: 10
          };

          /* Creation des materiels de frotements dans CANNON.JS */
        const groundMaterial = new CANNON.Material();
        const letterMaterial = new CANNON.Material();

        const contactMaterial = new CANNON.ContactMaterial(groundMaterial, letterMaterial, {
            friction: 0.01,
        })

        this.world.addContactMaterial(contactMaterial)

        /* Iterer dans les lignes à afficher */
        Array.from(this.navItems)
            .reverse()
            .forEach((item, i) => {
                const { innerText } = item;

                /* Creation d'un groupe THREE.JS qui va contenir les lettres */
                const words = new THREE.Group()
                words.letterOff = 0

                /* Creation du sol en dessus du mot */
                words.ground = new CANNON.Body({
                    mass: 0,
                    shape: new CANNON.Box(new CANNON.Vec3(50, 50, 0.1)),
                    quaternion: new CANNON.Quaternion().setFromEuler(Math.PI / -2, 0, 0),
                    position: new CANNON.Vec3(0, i * this.margin - this.offset, 0),
                    material: groundMaterial
                  });

                words.isGround = false;

                // Couleur aléatoire
                const randomColor = pick(colors)

                /* Iterer dans les lettres */
                Array.from(innerText).forEach((letter, j) => {
                    /* Creation du materiel en utilisant la couleur aléatoire */
                    const material = new THREE.MeshPhongMaterial({ color: randomColor.from.clone().lerp(randomColor.to, (j) / (innerText.length - 1)), shininess: 200 })
                    /* Creation de la geometry 3d avec les options décrite au dessus */
                    const geometry = new THREE.TextGeometry(letter, textOptions);

                    geometry.computeBoundingBox()
                    geometry.computeBoundingSphere()

                    /* Creation du mesh THREE.JS qui contient la geometry et le materiel */
                    const mesh = new THREE.Mesh(geometry, material);

                    /* On recupere la taille du mesh */
                    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3())
                    mesh.size.multiply(new THREE.Vector3(0.5, 0.5, 0.5))

                    /* On calcule sa position */
                    mesh.initPosition = new CANNON.Vec3(words.letterOff * 2, (this.navItems.length - 1 - i) * this.margin - this.offset, 0)
                    mesh.initPositionOffset = new CANNON.Vec3(mesh.initPosition.x, mesh.initPosition.y + i * 25 + 30 + j * 0.03, mesh.initPosition.z)

                    words.letterOff += mesh.size.x

                    /* Creation du corps dans CANNON.JS en utilisant le mesh THREE.JS */
                    const box = new CANNON.Box(new CANNON.Vec3().copy(mesh.size))

                    mesh.body = new CANNON.Body({
                        mass: this.totalMass / innerText.length,
                        position: mesh.initPositionOffset,
                        material: letterMaterial,
                        angularDamping: 0.99
                    })

                    const { center } = mesh.geometry.boundingSphere
                    mesh.body.addShape(box, new CANNON.Vec3(center.x, center.y, center.z))

                    this.world.addBody(mesh.body)
                    words.add(mesh);
                })

                words.children.forEach(letter => {
                    letter.body.position.x -= words.letterOff
                })

                this.words.push(words)
                this.scene.add(words)
            })

        this.setConstraints()
    }

    /**
     * Creation des contraintes entre chaque lettre pour quelle soit attacher
     */
    setConstraints() {
        this.words.forEach(word => {
            for(let i = 0; i < word.children.length; i++) {
                const letter = word.children[i];
                const nextLetter = (i === word.children.length - 1) ? null : word.children[i + 1];

                if(!nextLetter) continue;

                const c = new CANNON.ConeTwistConstraint(letter.body, nextLetter.body, {
                    pivotA: new CANNON.Vec3(letter.size.x * 2, 0, 0),
                    pivotB: new CANNON.Vec3(0, 0, 0),
                    axisA: CANNON.Vec3.UNIT_X,
                    axisB: CANNON.Vec3.UNIT_X,
                    angle: 0,
                    twistAngle: 0,
                    maxForce: 1e30
                })
                c.collideConnected = true;

                this.world.addConstraint(c)
            }
        })
    }

    /**
     * Boucle à 60FPS
     * La position calculer par CANNON.JS est mise dans le moteur THREE.JS
     */
    update() {
        if (!this.words) return;
    
        this.words.forEach((word, j) => {
          for (let i = 0; i < word.children.length; i++) {
            const letter = word.children[i];
    
            letter.position.copy(letter.body.position);
            letter.quaternion.copy(letter.body.quaternion);

            if(word.isGround) continue;
            
            if(letter.body.position.y + letter.initPosition.y <= 0) {
                word.isGround = true

                this.world.addBody(word.ground)
            }
          }
        });
    }

    getOffsetY(i) {
        return (this.navItems.length - i - 1) * this.margin - this.offset
    }
}

/* Couleur aléatoire */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const colors = [
    {
        from : new THREE.Color('#ff699f'),
        to   : new THREE.Color('#a769ff'),
    },
    {
        from : new THREE.Color('#683fee'),
        to   : new THREE.Color('#527ee1'),
    },
    {
        from : new THREE.Color('#ee663f'),
        to   : new THREE.Color('#f5678d'),
    },
    {
        from : new THREE.Color('#ee9ca7'),
        to   : new THREE.Color('#ffdde1'),
    },
    {
        from : new THREE.Color('#f7971e'),
        to   : new THREE.Color('#ffd200'),
    },
    {
        from : new THREE.Color('#56ccf2'),
        to   : new THREE.Color('#2f80ed'),
    },
    {
        from : new THREE.Color('#fc5c7d'),
        to   : new THREE.Color('#6a82fb'),
    },
    {
        from : new THREE.Color('#dce35b'),
        to   : new THREE.Color('#45b649'),
    },
]

// Initialisation de la scène
const scene = new Scene()