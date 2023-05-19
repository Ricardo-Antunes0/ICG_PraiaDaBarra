
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import waternormal from './assets/waternormals.jpg';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Mesh } from 'three';
import { SpotLightHelper } from 'three';


let camera, scene, renderer;
let controls, water, gaivotas, sun;
let boat,voley,peixes;
let step = 0;
let step1 = 0;
let sphere;
let meshes = [];
let boatModel = null;
let trashes = [];
const Count_trash = 10;

const loader = new GLTFLoader();

const options = {
    sphereColor: '#ffea00',
    voleyColor:  '#ffffff',
    voleyColor1: '#ffffff',
    voleyColor2: '#ffea00',
    wireframe_ball: false,
    speed: 0.01,
    angle: 0.2,
    penumbra: 0,
    intensity: 1,
    speed_volley: 0.01
};

class Peixes{
    constructor(){  
        loader.load("assets/peixe/fish_10.glb", (gltf) =>{
        scene.add(gltf.scene)
        gltf.scene.scale.set(1000, 1000,1000)
        gltf.scene.position.set(0,400,0)
        this.peixe = gltf.scene
        });
    }
}

class Gaivotas{
    constructor(){
        loader.load("assets/gaivotas/scene.gltf", (gltf) =>{
            scene.add(gltf.scene)
            gltf.scene.scale.set(80, 80,80)
            gltf.scene.position.set(-1000,450,-3500)
            this.gaivotas = gltf.scene
            this.gaiv = {
                rota: 0.02,
            }
        });
    }
    update() {
        if (this.gaivotas){
            this.gaivotas.getObjectByName('Dummy001').rotation.y += this.gaiv.rota;
        }
        this.gaivotas.traverse(function(node){
            if(node.isMesh)
                node.castShadow = true
            });
    }      
}

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
            if (this.boat.position.x >= this.maxX) {
                this.boat.position.x = this.maxX;
            } else if (this.boat.position.x <= this.minX) {
                this.boat.position.x = this.minX;
            }

            // Verificar limite de posição em Z
            if (this.boat.position.z >= this.maxZ) {
                this.boat.position.z = this.maxZ;
            } else if (this.boat.position.z <= this.minZ) {
                this.boat.position.z = this.minZ;
            }

            this.boat.rotation.y += this.speed.rot;
            this.boat.translateX(this.speed.vel);
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
    //renderer.setClearColor(0xF2F0DF);

   
    camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
    //camera.position.set( 30, 30, 100 );
    camera.position.set( -5500, 3000, 10000 );

    controls = new OrbitControls( camera, renderer.domElement );
    const gui = new dat.GUI();


    controls.target.set( 0, 10, 0 );
    controls.minDistance = 500.0;
    controls.maxDistance = 3500.0;
    controls.update();
 
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);   
  
    renderer.setClearColor(0xadd8e6)
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF,0.8);
    scene.add(directionalLight)
    directionalLight.position.set(-30,1700,-1300)
    directionalLight.castShadow = true;
    //const dLightHelp = new THREE.DirectionalLightHelper(directionalLight,500)
    //scene.add(dLightHelp)
    directionalLight.angle = 1
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height= 2048
    const d = 5000;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;
    directionalLight.shadow.camera.near = 500;
    directionalLight.shadow.camera.far = 3000;

    // Water
    const waterGeometry = new THREE.PlaneGeometry(6000, 4000, 3000);
    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('./assets/waternormals.jpg', function ( texture ) {
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
  
    //Adicionr gaivotas
    gaivotas = new Gaivotas;

    //DICIONAR PEIXES
    peixes = new Peixes();

    //Adicionar farol
    const farol = new Animacoes("assets/lighthouse/scene.gltf",[25, 25,25],[1000,-170,1700],[0,2.8,0]);

    //Adicionar bar
    const bar = new Animacoes("assets/bar/scene.gltf",[130, 150,130],[-300,130,2300],[0,0.05,0]);

    //Adicinar carro de gelado
    const gelados = new Animacoes("assets/gelados/scene.gltf",[0.5, 0.5,0.5],[150,200,2400],[0,-1.63,0]);

    //Adicionar prancha
    const prancha = new Animacoes("assets/prancha/scene.gltf",[70,70,70], [-700,330,2150],[-15, 25.2,-10.80]);
    const pranchaL = new Animacoes("assets/prancha/scene.gltf",[70,70,70], [-800,330,2150],[-15, 25.2,-10.4]);

    //Adicionar passadiços
    passadicos([3000,323.5,-1200],1.58);
    passadicos([3040,314.5,-700],1.58);
    passadicos([3060,304.4,-200],1.58);
    passadicos([3080,295,300],1.58);
    passadicos([3100,285,800],1.58);
    passadicos([3120,285,1300],1.58);
    passadicos([3150,285,1800],1.58);
    passadicos([3170,283,2300],1.58);

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
    madeira1.castShadow = true
    madeira2.castShadow = true
    madeira3.castShadow = true

    // Nadador salvador e os seus veiculos
    const mota = new Animacoes("assets/mota/scene.gltf",[200,200,200],[2300,10,-150],[-0.1,-1.6,0])
    const casa = new Animacoes("assets/nadador/scene.gltf",[60,70,60],[1900,380,550],[0,-1.5,0])

    //Adicionar bola de voley
    voley = new Voleyball();

    // Adicionar Barcos
    boat = new Boat();

    //Adicionar lixo
    for(let i = 0; i < Count_trash; i++){
        const trash = await createTrash()
        trashes.push(trash)
    }

    //Adicionar chinelos
    loader.load( 'assets/chinelo/scene.gltf', function( gltf ) {
        const mesh = gltf.scene.children[0];
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    
        Rocks(mesh, [300, 125, 900], [0, 5,-45.4], 0.6);
        Rocks(mesh, [300, 135, 1500], [0, 5,-45.4], 0.6);
        Rocks(mesh, [-500, 125, 900], [0, -5,-45.4], 0.6);
        Rocks(mesh, [-500, 135, 1500], [0, -5,-45.4], 0.6);
    });


    createRocks("assets/rock/scene.gltf");
    
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
    
    
    const sphereGeometry = new THREE.SphereGeometry(70, 10, 10);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x0000FF,
        wireframe: false});
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    sphere.position.set(-50, 135, 1200);
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    //Rede de voley
    const group = new THREE.Group();
    const ferroGeometry = new THREE.CylinderGeometry(15, 15, 500, 90);
    const ferroMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const ferro = new THREE.Mesh(ferroGeometry, ferroMaterial);
    ferro.position.set(-1100, 200, 1005);
    ferro.castShadow = true;
    ferro.receiveShadow = true;
    group.add(ferro);
    const cyl1 = ferro.clone();
    cyl1.position.set(-1945,200,1010);
    group.add(cyl1);

    const redeGeometry = new THREE.BoxGeometry(850,200,10,10,10,10);
    const redeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, wireframe:true });
    const rede = new THREE.Mesh(redeGeometry, redeMaterial);
    rede.position.set(-1520, 350, 1010);
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

    window.addEventListener( 'resize', onWindowResize );

    window.addEventListener('keydown', function(e){
       if(e.key == "ArrowUp"){
        boat.speed.vel = 13
       }
       if(e.key == "ArrowDown"){
        boat.speed.vel = -13
       }
       if(e.key == "ArrowLeft"){
        boat.speed.rot = 0.05
       }
       if(e.key == "ArrowRight"){
        boat.speed.rot = -0.05
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
    gui.add(options, 'speed', 0, 0.1);
    gui.add(options, 'angle', 0, 1);
    gui.add(options, 'penumbra', 0, 1);
    gui.add(options, 'intensity', 0, 1);
    gui.add(options,'speed_volley',0.01,0.5);



    animate();
}

//Funcoes----------------------------------/////////////////
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


function animate() {
    requestAnimationFrame( animate );
    
    boat.update();
    checkColisoes();

    voley.update();
    gaivotas.update();

    step += options.speed;
    sphere.position.y = 110 + 250* Math.abs(Math.sin(step));

    render();
}

function render(){
    water.material.uniforms[ 'time' ].value += 1 / 60.0;
    renderer.render( scene, camera );
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
    }
    if(position[0] == 3040 ){
        pa2R.rotation.z = -0.06
        pa2L.rotation.z = -0.06
    }
    
    if(position[0] == 3060 ){
        pa2R.rotation.z = -0.045
        pa2L.rotation.z = -0.045
    }
    if(position[0] == 3080 ){
        pa2R.rotation.z = -0.05
        pa2L.rotation.z = -0.05
    }
    if(position[0] == 3100 ){
        pa2R.rotation.z = -0.05
        pa2L.rotation.z = -0.05
    }
    if(position[0] == 3120){
        pa2R.rotation.z = -0.05
        pa2L.rotation.z = -0.05
    }
    if(position[0] == 3150){
        pa2R.rotation.z = -0.06
        pa2L.rotation.z = -0.06
    }

    if(position[0] == 3170){
        pa2R.rotation.z = -0.06
        pa2L.rotation.z = -0.06
        pa2R.scale.set(1,1.5,1)
        pa2R.position.set(position[0]+220,450,position[2]-360)
        pa2L.position.set(position[0]-170,450,position[2]-600);
    }

  
}

function createRocks(url){
        //ADICIONAR PEDRAS
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


//////////// Funções para criar vários lixos, detetar colisões e remover o lixo ao colidir
async function createTrash(){
    if(!boatModel){
        boatModel = await loadModel("assets/trash/scene.gltf")
    } return new Trash(boatModel.clone())
}

function colisao(obj1,obj2){
    return(
        Math.abs(obj1.position.x - obj2.position.x) < 150 && 
        Math.abs(obj1.position.z - obj2.position.z) < 300   
    )
}

async function loadModel(url){
    return new Promise((resolve,reject) => {
        loader.load(url, (gltf) =>{
            resolve(gltf.scene)
        }) })
}

function checkColisoes(){
    if(boat.boat){
        trashes.forEach(trash => {
            if(trash.trash && colisao(boat.boat,trash.trash)){
                
                scene.remove(trash.trash);
            }
        })
    }
}

//////////////////////////////////////////////////
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
       
    }
    else{
        plane.position.set(x - 150, y-170, z);
        const chair = await loadModel("assets/chair/scene.gltf")
        chair.scale.set(0.5,0.5,0.5)
        chair.position.set(x+210,y-45,z-20)
        chair.rotation.y = random(0.8, 2)
        chair.castShadow = true
        scene.add(chair)

        const ball = await loadModel("assets/ball/scene.gltf")
        ball.scale.set(45,45,45)
        ball.position.set(x-100,y-125,random(z-150,z+200))
        ball.castShadow = true
        scene.add(ball)

        const chinelos = await loadModel("assets/chinelos/scene.gltf") 
        chinelos.scale.set(0.2,0.2,0.2)
        chinelos.position.set(x+30,y-160,random(z-300,z+50))
        scene.add(chinelos)
    }


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
