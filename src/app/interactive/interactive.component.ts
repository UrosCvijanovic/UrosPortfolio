import { AfterViewInit, Component, Renderer2, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OBB } from 'three/examples/jsm/math/OBB.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThisReceiver } from '@angular/compiler';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MeshBasicMaterial, TextureLoader, Vector2 } from 'three';
import {GUI} from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// https://threejs.org/examples/?q=inter#webgl_math_obb
@Component({
  selector: 'app-interactive',
  templateUrl: './interactive.component.html',
  styleUrls: ['./interactive.component.css']
})
export class InteractiveComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('rootdiv', { static: true }) rootdiv!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock!: THREE.Clock;
  private raycaster!: THREE.Raycaster;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private mouse!: THREE.Vector2;
  private annotation: any;
  htmlStr!: string;
  private gui!: GUI;
  private textureLoader = new TextureLoader;
  private glbLoader = new GLTFLoader;
  private pics = ['chi-hung-wong-7z_TmCWC5C0-unsplash', 'florian-wehde-DpgujuZ92zE-unsplash', 'joel-fulgencio-r5Xd-F2st9w-unsplash', 'sarah-richer-eq02WXLT5Qk-unsplash'];
  private position = 0;
  private y = 0
  private pictures: any = [];
  private boxObject: any = [];

  constructor(private renderer2: Renderer2) { }

  ngAfterViewInit(): void {
    this.createScene();
    this.setCamera();
    this.intilizeObjects();
    this.createRenderer();
    //this.createControl();
    this.startRenderingLoop();
    this.addEvents();
    //this.initScene();
    //this.createControls();
  }
  private createRenderer() {
    this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, antialias: true } );
		this.renderer.setPixelRatio( devicePixelRatio );
		this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight);
  }


  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }


  private createScene() {
    this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xC4A484 );

    //this.clock = new THREE.Clock();
    //this.raycaster = new THREE.Raycaster();

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x222222, 1.5 );
		hemiLight.position.set( 1, 1, 1 );
		this.scene.add( hemiLight );

    //this.gui = new GUI();
    this.textureLoader = new TextureLoader();
    this.glbLoader = new GLTFLoader();
  }

  private intilizeObjects() {

    this.glbLoader.load( './assets/cupee.glb',  ( gltf ) =>{
      let cup = gltf.scene;
      cup.scale.set(0.4, 0.4, 0.4);
      cup.rotation.x = 0.2;
      cup.position.y = 3;
      this.boxObject.push(cup);
      this.scene.add(cup);
    } );  

    const textureGeom = new THREE.PlaneGeometry(1, 1.3);
    for (let i = 0; i < 4; i++){
        const material = new MeshBasicMaterial({
          map: this.textureLoader.load('./assets/' + this.pics[i] + '.jpg')
        });
        const img = new THREE.Mesh(textureGeom, material);
        img.position.set(2, i*-2, 0);
        this.scene.add(img);
        this.pictures.push(img);
    }
    /*
    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.setX(40);
    this.scene.add(mesh);
    */
    /*
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(group.rotation, {
		scrollTrigger: {
				trigger: "#trigger",
				start: "top top",
				end: "bottom top",
				markers: true,
				scrub: true,
				toggleActions: "restart pause resume pause"
			},
      y: Math.PI
    });
    */
  }

  private startRenderingLoop() {
    let component: InteractiveComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animate();
      //component.controls.update();
      //console.log(component.scene.children)
      //component.composer.render(component.scene);
      component.renderer.render(component.scene, component.camera);
    }());
  }
  private animate() {
    for ( let i = 0, len = this.boxObject.length; i < len; i ++ ) {
      this.boxObject[i].rotation.y += 0.02;
      //this.boxObject[i].position.y += 0.05;
    }
  }

  private addEvents() {
    this.renderer2.listen(this.rootdiv.nativeElement, "wheel", event => {
      this.onMouseWheel(event)});
    
    document.addEventListener( 'mousemove', this.onPointerMove );
    this.renderer2.listen(this.rootdiv.nativeElement, "pointermove", event => {
      this.onPointerMove(event);
     })

    /* 
     this.renderer2.listen(this.rootdiv.nativeElement, "click", event => {
      this.onClick(event);
     })
     */
  }
  private onMouseWheel(event: any) {
    this.y = event.deltaY * 0.0007;
    this.position -= this.y;
    this.camera.position.y = this.position;
    this.y *= 0.9;
  }
  private onPointerMove(event: any) {
    event.preventDefault();
    let raycaster = new THREE.Raycaster();
    let mouse = new Vector2();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    //console.log(this.camera);
    raycaster.setFromCamera( mouse, this.camera );
    const intersections = raycaster.intersectObjects( this.pictures, false );
    //console.log(intersections);
    if ( intersections.length > 0 ) {
      // determine closest intersection and highlight the respective 3D object
      document.body.style.cursor = 'pointer';
      gsap.to(intersections[0].object.scale, {x: 1.5, y: 1.5});
      gsap.to(intersections[0].object.rotation, {y: -0.5});
      gsap.to(intersections[0].object.position, {z: -0.8});
    
    } else {
      document.body.style.cursor = 'default';
      for (const obj of this.pictures){
        gsap.to(obj.scale, {x: 1, y: 1});
        gsap.to(obj.rotation, {y: 0});
        gsap.to(obj.position, {z: 0});
      }
    }
  }


private sortIntersections( a: { distance: number; }, b: { distance: number; } ) {
  return a.distance - b.distance;
}

  createControl() {
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    //this.controls.enableDamping = false;
    //this.controls.enableZoom = true;
    //this.controls.enablePan = false; 
    //this.controls.enableRotate = false;
    
    this.renderer2.appendChild(this.rootdiv.nativeElement, this.renderer.domElement );
  }
  setCamera() {
    this.camera = new THREE.PerspectiveCamera( 75, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 100 );
    this.camera.position.set( 0, 7, 2 );
    //this.gui.add(this.camera.position, 'y').min(-5).max(10);
  }

  ngOnInit(): void {
  }

}