import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { Water } from 'three/examples/jsm/objects/Water.js';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import sky from '/assets/dia.png';
import skyNoite from '/assets/noite.jpg';


let camera,activeCamera, cameraFarol, scene, renderer,controls;
let water, gaivotas, farol, sun, moon, boat, voley, aviao, stick,pub, sphere;
let directionalLight,spotLight;
let step = 0, step1 = 0;
let boatView = false;
let farolView = false;
let meshes = [], trashes = [];;
let boatModel = null;
const Count_trash = 10;

// Definir a direção da luz solar para apontar para o plano e seguir o seu movimento
const direction = new THREE.Vector3(0, -0.7, 1);

//Valor minimo em y`` que a câmara pode ir
const minY = 100;
const textureLoader = new THREE.TextureLoader();
const loader = new GLTFLoader();

//variável de estado para controlar o sentido do movimento do avião
let movingForward = true;

const options = {
    sphereColor: '#ffea00',
    voleyColor:  '#ffffff',
    voleyColor1: '#ffffff',
    voleyColor2: '#ffea00',
    wireframe_ball: false,
    speed: 0,
    speed_volley: 0 
};

class Boat{
    constructor(){
        loader.load("assets/boat/scene.gltf", (gltf) =>{
            scene.add(gltf.scene)
            gltf.scene.scale.set(50, 50,50)
            gltf.scene.position.set(-500,228,-3000)
            gltf.scene.rotation.y = 1.6
            this.boat = gltf.scene
            this.speed = {
                vel: 0,
                rot: 0,
            }
        });
        this.minX = -2600; // Limite mínimo para o eixo X
        this.maxX = 2100; // Valor máximo para o eixo X
        this.minZ = -4900; // Valor mínimo para o eixo Z
        this.maxZ = -1400; // Limite máximo para o eixo Z
    }
    update() {
        if (this.boat) {
            // Verificar limite de posição em X
            if(this.boat.position.x >= this.maxX){
                this.boat.position.x = this.maxX;
            }else if (this.boat.position.x <= this.minX){
                this.boat.position.x = this.minX;
            }

            // Verificar limite de posição em Z
            if(this.boat.position.z >= this.maxZ) {
                this.boat.position.z = this.maxZ;
            }else if (this.boat.position.z <= this.minZ){
                this.boat.position.z = this.minZ;
            }

            this.boat.rotation.y += this.speed.rot;
            this.boat.translateX(this.speed.vel);

            controls.update();
            if (boatView) {
                const cameraPosition = new THREE.Vector3(-500, 800, -2000);
                const cameraTarget = this.boat.position.clone();
                camera.position.copy(cameraPosition);
                camera.lookAt(cameraTarget);
            }
        }
    }
    stop(){
        this.speed.rot = 0
        this.speed.vel = 0
    }
}

class Trash{
    constructor(_scene){
        scene.add(_scene)
        _scene.scale.set(40,40,40)
        _scene.position.set(random(-2500,2000),-20,random(-4500,-1700))    
        this.trash = _scene    
    }
}

class Aviao{
    constructor(){
        loader.load("assets/aviao/scene.gltf", (gltf) =>{
            scene.add(gltf.scene)
            gltf.scene.scale.set(110,110,105)
            gltf.scene.position.set(12500,3200,-5000)
            this.aviao = gltf.scene


            const pubTexture = new THREE.TextureLoader().load('./assets/deti.png');
            pub = new THREE.Mesh(
                new THREE.BoxGeometry(1000,400,4),
                new THREE.MeshBasicMaterial({ 
                    map: pubTexture,
                }) 
             );
            pub.position.set(13700,3200,-5000)
            scene.add(pub)

            const stickGeometry = new THREE.CylinderGeometry(5, 5, 400, 90);
            const stickMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
            stick = new THREE.Mesh(stickGeometry, stickMaterial);
            stick.position.set(13000, 3200, -5000);
            stick.rotation.z = 1.6;
            stick.castShadow = true;
            stick.receiveShadow = true;
            scene.add(stick);
        });

    }
    update(){  
        if (this.aviao) {
            if(movingForward){
                // Movimento para a frente (x diminui)
                this.aviao.translateX(-20);
                pub.position.x -= 20;
                stick.position.x -= 20;
                if (this.aviao.position.x <= -10000) {
                    movingForward = false;
                    // Inverte a ordem dos elementos
                    const tempPositionX = pub.position.x;
                    pub.position.x = this.aviao.position.x - 150;
                    this.aviao.position.x = tempPositionX - 30;   
                    this.aviao.rotation.y = Math.PI;
                }
            }else{
                // Movimento de volta (x aumenta)
                this.aviao.translateX(-20);
                pub.position.x += 20;
                stick.position.x += 20;
             
                if (this.aviao.position.x >= 12950){
                    movingForward = true;
                    // Inverte a ordem dos elementos
                    const tempPositionX = pub.position.x;
                    pub.position.x = this.aviao.position.x;
                    this.aviao.position.x = tempPositionX;
                    this.aviao.rotation.y -= Math.PI;
                }
            }
            if (this.aviao.position.x <= 5000 && this.aviao.position.x >= 1000) {
                if(movingForward == true){
                    this.aviao.position.y -= 7;
                    pub.position.y -= 7;
                    stick.position.y -= 7;
                }
                else{
                    this.aviao.position.y += 7;
                    pub.position.y += 7;
                    stick.position.y += 7;
                }
              } else if (this.aviao.position.x <= 1000 && this.aviao.position.x >= -3000) {
                    if(movingForward == true){
                        this.aviao.position.y += 7;
                        pub.position.y += 7;
                        stick.position.y += 7;
                    }
                    else{
                        this.aviao.position.y -= 7;
                        pub.position.y -= 7;
                        stick.position.y -= 7;
                    }
              } else {
                    this.aviao.position.y = 3190;
                    pub.position.y = 3200;
                    stick.position.y = 3200;
                }
               
            }
        }
    }

class Gaivotas{
    constructor(){
        loader.load("assets/gaivotas/scene.gltf", (gltf) =>{
            scene.add(gltf.scene)
            gltf.scene.scale.set(80, 80,80)
            gltf.scene.position.set(-1000,350,-3500)
            this.gaivotas = gltf.scene
            this.gaiv = {
                rota: 0.02,
            }
        });
    }
    update() {
        if(this.gaivotas){
            this.gaivotas.getObjectByName('Dummy001').rotation.y += this.gaiv.rota;
        }
        this.gaivotas.traverse(function(node){
            if(node.isMesh)
                node.castShadow = true
            });
    }      
}

class Voleyball{
    constructor(){
        loader.load("assets/voley/scene.gltf", (gltf) =>{
            scene.add(gltf.scene)
            gltf.scene.scale.set(2,2,2)
            gltf.scene.position.set(-1530,0,-1000)
            gltf.scene.rotation.y = 1.6
            this.voley = gltf.scene
        });
    }
    update() {
        step1 += options.speed_volley;
        if (this.voley){
            this.voley.position.y = 100+(500 * Math.abs(Math.sin(step1)));
            this.voley.position.z = 900+(300 * Math.cos(step1));
        }
    }
    color(){
        this.voley.getObjectByName('Object009_02_-_Default_0').material.color.set(options.voleyColor);
        this.voley.getObjectByName('Object009_01_-_Default_0').material.color.set(options.voleyColor1);
        this.voley.getObjectByName('Object009_03_-_Default_0').material.color.set(options.voleyColor2); 
    }   
}

init();

async function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled=true;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild( renderer.domElement );


    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(-6500, 4500, 12000);

    cameraFarol = new THREE.PerspectiveCamera(95,window.innerWidth / window.innerHeight,1,20000);
    cameraFarol.position.set(1000,1000,1700);
    cameraFarol.lookAt(scene.position);

    activeCamera = camera;

    scene.add(camera);
    scene.add(cameraFarol);

    controls = new OrbitControls( camera, renderer.domElement );
    const gui = new dat.GUI();

    controls.target.set(0, 10, 0);
    controls.minDistance = 500.0;
    controls.maxDistance = 3500.0;
    controls.update();
    
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);   
  
    // Definir a luz do sol
    directionalLight = new THREE.DirectionalLight(0xeead2d, 0.8)
    directionalLight.castShadow = true;
    directionalLight.angle = 1
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height= 2048
    const d = 5000;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;
    directionalLight.shadow.camera.near = 500;
    directionalLight.shadow.camera.far = 8000;

    //Definir a luz da lua
    spotLight = new THREE.SpotLight(0xffffff,6,9000,1,0.2);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height= 2048;
    spotLight.shadow.camera.left = - d;
    spotLight.shadow.camera.right = d;
    spotLight.shadow.camera.top = d;
    spotLight.shadow.camera.bottom = - d;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 8000;
    
    // Criar o sol
    const sunTexture = new THREE.TextureLoader().load('./assets/sun.jpg');
    const normalTexture = new THREE.TextureLoader().load('./assets/normal.jpg');
    sun = new THREE.Mesh(
        new THREE.SphereGeometry(140, 32, 32),
        new THREE.MeshBasicMaterial({ 
            map: sunTexture,
            normalMap: normalTexture
        })
    );
    sun.position.set(0, 0, -7000);
    scene.add(sun);


    // Criar a lua
    const moonTexture = new THREE.TextureLoader().load('./assets/moon.jpg');
    moon = new THREE.Mesh(
        new THREE.SphereGeometry(140, 32, 32),
        new THREE.MeshBasicMaterial({ 
            map: moonTexture,
            normalMap: normalTexture
        })
    );
    moon.position.set(0, 0, -7000);
    scene.add(moon);

    // Criar o oceano
    const waterGeometry = new THREE.PlaneGeometry(6000, 4000, 3000);
    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: textureLoader.load('./assets/waternormals.jpg', function ( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x006994,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x = - Math.PI / 2;
    water.rotation.z = 0.1
    water.position.set(150,0,-3200)
    water.receiveShadow = true
    scene.add(water);

    //Adicionar Areia
    const sand = new Animacoes("assets/sand/scene.gltf",[700,200,570],[5050,340,900],[0,1.63,0]);
  
    //Adicionar gaivotas
    gaivotas = new Gaivotas();

    //Adicionar farol
    farol = new Animacoes("assets/lighthouse/scene.gltf",[25, 25,25],[1000,-170,1700],[0,2.8,0]);

    //Adicionar bar
    const bar = new Animacoes("assets/bar/scene.gltf",[140, 150,140],[-1200,130,2300],[0,0.05,0]);
    
    //Adicionar mesa
    const table = new Animacoes("assets/table/scene.gltf",[140, 150,140],[-400,170,2400],[0,0.05,0]);

    //Adicionar sombrilha1
    const sombrilha = new Animacoes("assets/sombrilha/scene.gltf",[200, 200,200],[-400,150,2250],[0,0.05,0]);

    //Adicionar prancha
    const prancha = new Animacoes("assets/prancha/scene.gltf",[80,80,80], [-1600,350,2150],[-15, 25.2,-10.80]);
    const pranchaL = new Animacoes("assets/prancha/scene.gltf",[80,80,80], [-1700,350,2150],[-15, 25.2,-10.4]);

    const mota = new Animacoes("assets/mota/scene.gltf",[200,200,200],[2300,10,-150],[-0.1,-1.6,0])

    // Edificio do nadador salvador
    const casa = new Animacoes("assets/nadador/scene.gltf",[60,70,60],[1900,380,550],[0,-1.5,0])

    //Adicionar uma bola de voley
    voley = new Voleyball();

    // Adicionar um barco
    boat = new Boat();
    
    //Criar aviao
    aviao = new Aviao();

    //Adicionar passadiços
    passadicos([3000,323.5,-1200],1.58);
    passadicos([3040,314.5,-700],1.58);
    passadicos([3060,304.4,-200],1.58);
    passadicos([3080,295,300],1.58);
    passadicos([3100,285,800],1.58);
    passadicos([3120,285,1300],1.58);
    passadicos([3150,285,1800],1.58);
    passadicos([3170,283,2300],1.58);

    //Adicionar 10 lixos
    for(let i = 0; i < Count_trash; i++){
        const trash = await createTrash()
        trashes.push(trash)
    }

    //Criar as rochas
    createRocks("assets/rock/scene.gltf");
    
    //Adicionar os items necessarios para a praia
    addSunshade(0xff00ff, 50, 200, 0) // pink
    addSunshade(0xff00ff, -500, 200, -100) // pink
    addSunshade(0x0000FF,-1100, 205, 0) // blue
    addSunshade(0xff0000, -1000, 190, -1000) // red
    addSunshade(0xff0000, -1800, 190, -700) // red
    addSunshade(0xE97451, -2300, 190, -600) // orange
    addSunshade(0xff0000,  100, 190, -700) // red
    addSunshade(0x00ff00, -300, 190, -700) // green
    addSunshade(0xFFFF00, -1700, 205, -100) // yellow
    addSunshade(0x808080, -2200, 220, 50) // grey
    
    //Criar o campo de futebol
    createField();

    //Criar a rede e campo de volley
    createRede();


    window.addEventListener( 'resize', function(){
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );

    });

    window.addEventListener('keydown', function(e){
       if(e.key == "ArrowUp"){
        boat.speed.vel = 15
       }
       if(e.key == "ArrowDown"){
        boat.speed.vel = -15
       }
       if(e.key == "ArrowLeft"){
        boat.speed.rot = 0.05
       }
       if(e.key == "ArrowRight"){
        boat.speed.rot = -0.05
       }
       if(e.key === '1'){
        boatView = !boatView;
       }
       if(e.key === '2'){
            if(activeCamera === camera){ // Se a câmera atual for "camera"
                activeCamera = cameraFarol; // Alterne para a câmera do farol
            } else {
                activeCamera = camera; // Caso contrário, volte para a câmera padrão
            }
       }
    })
    window.addEventListener('keyup',function(e){
        boat.stop();
    })

    gui.addColor(options, 'sphereColor').onChange(function(e){
        sphere.material.color.set(e);
    });
    gui.addColor(options, 'voleyColor').onChange(function(e){
        voley.color();});
    gui.addColor(options, 'voleyColor1').onChange(function(e){
        voley.color();});
    gui.addColor(options, 'voleyColor2').onChange(function(e){
        voley.color();});
    gui.add(options, 'wireframe_ball').onChange(function(e){
        sphere.material.wireframe = e;
    });
    gui.add(options, 'speed', 0, 0.5);
    gui.add(options,'speed_volley',0,0.5);


    animate();
}


////////////    FUNCOES  /////////////////
function onWindowResize() {

}

// Variáveis de controle da animação
const circleRadius = 3000;
const ScenerotationSpeed = 0.00020;
let isDaytime = true;

function animate() {
    requestAnimationFrame(animate);

    //Verificar se é dia ou noite
    const sunY = sun.position.y;
    if(sunY >= 0 && !isDaytime){
        scene.add(directionalLight);   //Aparecer a luz direcional para o dia
        scene.remove(spotLight);
        scene.background = textureLoader.load(sky);
        isDaytime = true;
    }else if(sunY < 0 && isDaytime){
        scene.remove(directionalLight); //Remover a luz direcional para a noite
        scene.add(spotLight);
        scene.background = textureLoader.load(skyNoite);
        isDaytime = false;
    }

    //Atualizações das posições do sol e da lua
    const time = Date.now() * ScenerotationSpeed;
    sun.position.x = Math.cos(time) * circleRadius;
    sun.position.y = Math.sin(time) * circleRadius;
    moon.position.x = Math.cos(time + Math.PI) * circleRadius;
    moon.position.y = Math.sin(time + Math.PI) * circleRadius;

    //Definir as luzes nas meshes
    directionalLight.position.set(sun.position.x,sun.position.y,sun.position.z);
    spotLight.position.set(moon.position.x,moon.position.y,moon.position.z);
    
    //Definir as posicoes para onde as luzes vão apontar
    target();

    //Velocidade da bola
    step += options.speed;
    sphere.position.y = 110 + 250* Math.abs(Math.sin(step));

    boat.update();
    checkColisoes();
    voley.update();
    gaivotas.update();
    aviao.update();

    render();
}


function render(){
    water.material.uniforms[ 'time' ].value += 1 / 60.0;
    //Verifique se a posição y da câmera está abaixo do limite mínimo
    if (camera.position.y < minY)   camera.position.y = minY;//Definir o y`` da câmara para o limite mínimo
    renderer.render( scene, activeCamera);
}

function Animacoes(url,scale,position,rotation){
    loader.load(url, function(gltf){
        const model = gltf.scene;
        scene.add(model)
        model.scale.set(scale[0],scale[1],scale[2])
        model.position.set(position[0],position[1],position[2])
        model.rotation.x = rotation[0]
        model.rotation.y = rotation[1]
        model.rotation.z = rotation[2]
        model.castShadow = true
        model.receiveShadow = true

        model.traverse(function(node){
            if(node.isMesh)
                node.receiveShadow = true
            });
    });
}

  // Definir os alvos da directionalLight e spotLight para a direção desejada
function target(){
    const sunTarget = new THREE.Object3D();
    const moonTarget = new THREE.Object3D();
    sunTarget.position.set(
        sun.position.x + direction.x,
        sun.position.y + direction.y,
        sun.position.z + direction.z
    );

    moonTarget.position.set(
        moon.position.x + direction.x,
        moon.position.y + direction.y,
        moon.position.z + direction.z
    );

    scene.add(sunTarget);
    scene.add(moonTarget);
    directionalLight.target = sunTarget;
    spotLight.target = moonTarget;
}

// Criar os passadiços
function passadicos(position,rotationX){
    const textureMadeira = new THREE.TextureLoader().load('/assets/madeira.jpg');
    const madeiraGeometry = new THREE.BoxGeometry(450,500,50);
    const madeiraMaterial = new THREE.MeshStandardMaterial({ map: textureMadeira, side: THREE.DoubleSide })
    const madeira = new THREE.Mesh(madeiraGeometry,madeiraMaterial)
    madeira.rotation.z = -0.055
    madeira.rotation.x = rotationX+0.01
    madeira.position.set(position[0]+20,position[1],position[2]-240)
    scene.add(madeira)

    const pauGeometry = new THREE.CylinderGeometry(30, 30, 600, 90);
    const pauMaterial = new THREE.MeshStandardMaterial({ map: textureMadeira, side: THREE.DoubleSide })
    const pauL = new THREE.Mesh(pauGeometry, pauMaterial);
    pauL.position.set(position[0]+200,330,position[2]-400);
    pauL.castShadow = true;
    pauL.receiveShadow = true;
    scene.add(pauL)
    
    const pauR = pauL.clone()
    pauR.position.set(position[0]-190,330,position[2]-400);
    pauR.castShadow = true;
    scene.add(pauR)

    //Horizontal
    const pa2LGeometry = new THREE.CylinderGeometry(30, 30, 500, 90);
    const pa2LMaterial = new THREE.MeshStandardMaterial({ map: textureMadeira, side: THREE.DoubleSide })
    const pa2L = new THREE.Mesh(pa2LGeometry, pa2LMaterial);
    pa2L.position.set(position[0]-170,450,position[2]-360);
    pa2L.castShadow = true;
    pa2L.receiveShadow = true;
    scene.add(pa2L)
    pa2L.rotation.x = rotationX

    const pa2R = pa2L.clone()
    pa2R.position.set(position[0]+220,450,position[2]-360);
    pa2R.castShadow = true;
    pa2R.receiveShadow = true;
    scene.add(pa2R)
    pa2R.rotation.x = rotationX    

    if(position[0] == 3000 ){
        pa2R.rotation.z = -0.08
        pa2L.rotation.z = -0.08
    }if(position[0] == 3040 ){
        pa2R.rotation.z = -0.06
        pa2L.rotation.z = -0.06
    }if(position[0] == 3060 ){
        pa2R.rotation.z = -0.045
        pa2L.rotation.z = -0.045
    }if(position[0] == 3080 ){
        pa2R.rotation.z = -0.05
        pa2L.rotation.z = -0.05
    }if(position[0] == 3100 ){
        pa2R.rotation.z = -0.05
        pa2L.rotation.z = -0.05
    }if(position[0] == 3120){
        pa2R.rotation.z = -0.05
        pa2L.rotation.z = -0.05
    }if(position[0] == 3150){
        pa2R.rotation.z = -0.06
        pa2L.rotation.z = -0.06
    }if(position[0] == 3170){
        pa2R.rotation.z = -0.06
        pa2L.rotation.z = -0.06
        pa2R.scale.set(1,1.5,1)
        pa2R.position.set(position[0]+220,450,position[2]-360)
        pa2L.position.set(position[0]-170,450,position[2]-600);
    }

    //Criar as últimas partes do passadiços
    if(position[0] ==3170 && position[1]==283 && position[2]==2300){
        const textureMadeira = new THREE.TextureLoader().load('/assets/madeira.jpg');
        const madeira1Geometry = new THREE.BoxGeometry(500,450,50);
        const madeira1Material = new THREE.MeshStandardMaterial({ map: textureMadeira, side: THREE.DoubleSide })
        const madeira1 = new THREE.Mesh(madeira1Geometry,madeira1Material)
        
        madeira1.rotation.z= -1.515
        madeira1.rotation.y= -0.5
        madeira1.rotation.x= -1.52

        madeira1.position.set(2775,180,2080)
        scene.add(madeira1)

        const madeira2Geometry = new THREE.BoxGeometry(500,750,50);   
        const madeira2 = new THREE.Mesh(madeira2Geometry,madeira1Material)   
        madeira2.rotation.z= -1.515
        madeira2.rotation.y= -0.02
        madeira2.rotation.x= -1.55
        madeira2.position.set(2225,85,2110)
        scene.add(madeira2)

        const madeira3 = madeira2.clone()
        madeira3.position.set(1850,78,2130)
        scene.add(madeira3)
    }
}

// Campo de futebol com chinelos
function createField(){
    //Adicionar chinelos
    Animacoes('assets/chinelo/scene.gltf',[0.6,0.6,0.6], [500, 125, 900], [0, 5,-45.4] )
    Animacoes('assets/chinelo/scene.gltf',[0.6,0.6,0.6], [500, 135, 1500], [0, 5,-45.4])
    Animacoes('assets/chinelo/scene.gltf',[0.6,0.6,0.6], [-500, 135,900], [0, -5,-45.4])
    Animacoes('assets/chinelo/scene.gltf',[0.6,0.6,0.6], [-500, 135, 1500], [0, -5,-45.4])

    //Criar a bola de futebol
    const sphereGeometry = new THREE.SphereGeometry(70, 10, 10);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x0000FF,
        wireframe: false});
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    sphere.position.set(-50, 165, 1200);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
}
   
//Campo e rede de volley
function createRede(){
    const group = new THREE.Group();
    const ferroGeometry = new THREE.CylinderGeometry(15, 15, 400, 90);
    const ferroMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const ferro = new THREE.Mesh(ferroGeometry, ferroMaterial);
    ferro.position.set(-1100, 300, 1005);
    ferro.castShadow = true;
    ferro.receiveShadow = true;
    group.add(ferro);
    const cyl1 = ferro.clone();
    cyl1.position.set(-1945,300,1010);
    group.add(cyl1);

    const redeGeometry = new THREE.BoxGeometry(850,200,10,10,10,10);
    const redeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, wireframe:true });
    const rede = new THREE.Mesh(redeGeometry, redeMaterial);
    rede.position.set(-1520, 400,1010);
    rede.castShadow = true;
    rede.receiveShadow = true;
    group.add(rede);

    const geo = new THREE.CylinderGeometry(15, 15, 1200, 90);
    const mat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    const chaorede = new THREE.Mesh(geo, mat);
    chaorede.position.set(-910, 60, 975);
    chaorede.castShadow = true;
    chaorede.rotation.x = 1.52
    chaorede.rotation.z = -0.03
    chaorede.castShadow = true;
    group.add(chaorede);


    const chaoredeR = chaorede.clone();
    chaoredeR.position.set(-2100, 65, 1000);
    chaoredeR.castShadow = true;
    chaoredeR.rotation.x = 1.52
    chaoredeR.rotation.z = -0.05
    chaoredeR.castShadow = true;
    group.add(chaoredeR);

    const chaoredeB = chaorede.clone();
    chaoredeB.position.set(-1535, 35, 400);
    chaoredeB.castShadow = true;
    chaoredeB.rotation.x = 1.52
    chaoredeB.rotation.z = 1.55
    chaoredeB.castShadow = true;
    group.add(chaoredeB);

    const chaoredeC = chaorede.clone();
    chaoredeC.position.set(-1480, 90, 1585);
    chaoredeC.castShadow = true;

    chaoredeC.rotation.z = 1.55
    chaoredeC.receiveShadow = true;
    group.add(chaoredeC);

    scene.add(group);
}

//ADICIONAR PEDRAS
function createRocks(url){
    loader.load( url, function( gltf ) {
        const mesh = gltf.scene.children[0];
    
        mesh.material = new THREE.MeshPhongMaterial({
            flatShading: true,
            color: 0x7787aa,
            shininess: 0,
        });
    
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    
        Rocks(mesh, [2850, 20, -2000], [0, 55, 180], 50);
        Rocks(mesh, [2900, 20, -2500], [0, 55, 180], 90);
        Rocks(mesh, [2800, 20, -2900], [0, 55, 180], 60);
        Rocks(mesh, [2800, 20, -3600], [0, -52, 180], 50);
        Rocks(mesh, [2800, 20, -4100], [0, 5, 180], 70);
        Rocks(mesh, [3000, 20, -3200], [0, 55, 180], 80);
        Rocks(mesh, [2750, 20, -3200], [0, 55, 180], 60);
        Rocks(mesh, [2500, 20, -3300], [0, -51, 180], 60);
        Rocks(mesh, [2700, 20, -5300], [0, 5, 180], 50);
        Rocks(mesh, [2900, 20, -4500], [0, 55, 180], 80);
        Rocks(mesh, [2700, 20, -5100], [0, 0, 180], 60);

    });
}

function Rocks(mesh, position, rotation, scale) {
    const newMesh = mesh.clone();

    newMesh.scale.set(
        scale,
        scale,
        scale);

    newMesh.position.set(
        position[0],
        position[1],
        position[2]);

    newMesh.rotation.set(
        rotation[0],
        rotation[1],
        rotation[2]);

    scene.add(newMesh);
    newMesh.matrixAutoUpdate = false;
    newMesh.updateMatrix();
    meshes.push(newMesh);
}

function random(min,max){
    return Math.random() * (max - min) + min;
}


//////////// Função para criar vários lixos
async function createTrash(){
    if(!boatModel){
        boatModel = await loadModel("assets/trash/scene.gltf")
    } return new Trash(boatModel.clone())
}

//Função para detetar colisões
function colisao(obj1,obj2){
    return(
        Math.abs(obj1.position.x - obj2.position.x) < 150 && 
        Math.abs(obj1.position.z - obj2.position.z) < 300   
    )
}

// Função para remover o lixo ao colidir
function checkColisoes(){
    if(boat.boat){
        trashes.forEach(trash => {
            if(trash.trash && colisao(boat.boat,trash.trash)){   
                scene.remove(trash.trash);
            }
        })
    }
}

//Função para returnar modelos gltf
async function loadModel(url){
    return new Promise((resolve,reject) => {
        loader.load(url, (gltf) =>{
            resolve(gltf.scene)
        }) })
}

const balls = [];
async function addSunshade(color, x, y, z) {
    const group = new THREE.Group();

    const geometry = new THREE.ConeGeometry(140, 80, 8);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const cone = new THREE.Mesh(geometry, material);
    cone.position.set(x, y+35, z);    
    cone.castShadow = true;
    group.add(cone);

    const geometry2 = new THREE.CylinderGeometry(15, 15, 250, 90);
    const material2 = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const cylinder = new THREE.Mesh(geometry2, material2);
    cylinder.position.set(x, y - 60, z);
    cylinder.castShadow = true;
    group.add(cylinder);
   
    const texture = new THREE.TextureLoader().load( 'assets/toalha.png' );
    const geometry3 = new THREE.PlaneGeometry(140, 320);
    const material3 = new THREE.MeshPhongMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry3, material3);

    plane.rotation.x = -Math.PI / 2;
 
    if (color === 0xff0000 || color === 0xFFFF00 || color === 0x808080){
        plane.position.set(x + 150, y-170, z);  
        if(color == 0xff0000)
            Animacoes("assets/unicorn/scene.gltf",[35,35,35],[x,y-150,z-80],[0,random(0.8, 2),0])

    }else{
        plane.position.set(x - 150, y-170, z);
        const chair = new Animacoes("assets/chair/scene.gltf",[0.5,0.5,0.5],[x+210,y-45,z-20],[0,random(0.8, 2),0]);
        const ball = new Animacoes("assets/ball/scene.gltf",[45,45,45],[x-100,y-125,random(z-150,z+200)],[0,0,0]);
        const chinelos = new Animacoes("assets/chinelos/scene.gltf",[0.2,0.2,0.2],[x+30,y-160,random(z-300,z+50)],[0,0,0]);
    }

    var windbreakerGeometry = new THREE.BoxGeometry(400, 200, 1);
    var windbreakerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x808080,
        side: THREE.DoubleSide // enable double-sided rendering
    });
    var windbreaker = new THREE.Mesh(windbreakerGeometry, windbreakerMaterial);
    var windbreaker1 = windbreaker.clone()
    windbreaker.position.set(150, 120, -400);
    windbreaker1.position.set(-50, 120, -600);
    windbreaker1.rotation.y = 1.6
    scene.add(windbreaker);
    scene.add(windbreaker1);
    windbreaker.castShadow = true;
    windbreaker1.castShadow = true;

    const bandeiraG = new THREE.BoxGeometry(150,100,5);
    const bandeiraM = new THREE.MeshStandardMaterial({color: 0x00ff00, side: THREE.DoubleSide})
    const bandeira = new THREE.Mesh(bandeiraG,bandeiraM);
    bandeira.position.set(1705,650,665)
    
    const ferroBandeiraG = new THREE.CylinderGeometry(15, 15, 700, 90);
    const ferroBandeiraM = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    const  ferroBandeira = new THREE.Mesh(ferroBandeiraG, ferroBandeiraM);
    ferroBandeira.position.set(1640,400,670)
    bandeira.castShadow = true;
    ferroBandeira.castShadow = true;
    group.add(bandeira)
    group.add(ferroBandeira)

    plane.castShadow = true;
    plane.receiveShadow = true;

    group.add(plane);
    scene.add(group);
}
