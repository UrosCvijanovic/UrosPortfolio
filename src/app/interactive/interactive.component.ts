import { AfterViewInit, Component, Renderer2, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OBB } from 'three/examples/jsm/math/OBB.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThisReceiver } from '@angular/compiler';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  private objects : Array<THREE.Mesh> = [];
  private hitbox!: THREE.Mesh;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private mouse!: THREE.Vector2;
  private annotation: any;
  htmlStr!: string;



  constructor(private renderer2: Renderer2) { }

  ngAfterViewInit(): void {
    this.createScene();
    this.setCamera();
    this.intilizeObjects();
    this.createRenderer();
    this.addEvents();
    this.createControl();
    this.startRenderingLoop();
    //this.initScene();
    //this.createControls();
  }
  private createRenderer() {
    this.renderer = new THREE.WebGLRenderer( { canvas: this.canvas, alpha: true, antialias: true } );
		this.renderer.setPixelRatio( devicePixelRatio );
		this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight * 2 );
  }


  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }


  private createScene() {
    this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xffffff );

    //this.clock = new THREE.Clock();
    //this.raycaster = new THREE.Raycaster();

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x222222, 1.5 );
		hemiLight.position.set( 1, 1, 1 );
		this.scene.add( hemiLight );

    this.raycaster = new THREE.Raycaster();
  }

  private intilizeObjects() {
    const objectsDistance = 2
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = - objectsDistance * 0;
    group.add(mesh);


    const mesh1 = new THREE.Mesh(geometry, material);
    mesh1.position.y = - objectsDistance * 1;
    group.add(mesh1);

    const mesh2 = new THREE.Mesh(geometry, material);
    mesh2.position.y = - objectsDistance * 2;
    group.add(mesh2);
    this.scene.add(group);

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
  }

  private startRenderingLoop() {
    let component: InteractiveComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animate();
      component.controls.update();
      //component.composer.render(component.scene);
      component.renderer.render(component.scene, component.camera);
    }());
  }
  animate() {
    //for ( let i = 0, len = this.objects.length; i < len; i ++ ) {
      //this.objects[i].position.x += 0.05;
      //this.objects[i].position.y += 0.05;
    //}
  }

  private addEvents() {
    document.addEventListener( 'pointermove', this.onPointerMove );
    this.renderer2.listen(this.rootdiv.nativeElement, "pointermove", event => {
      this.onPointerMove(event);
     })

     /*
     this.renderer2.listen(this.rootdiv.nativeElement, "click", event => {
      this.onClick(event);
     })
     */
  }
  private onPointerMove(event: any) {
    event.preventDefault();
    this.mouse.x = ( event.clientX / this.canvas.clientWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / this.canvas.clientHeight ) * 2 + 1;
    this.raycaster.setFromCamera( this.mouse, this.camera );
    const intersectionPoint = new THREE.Vector3();
    const intersections = this.raycaster.intersectObjects( this.scene.children, false );

    if ( intersections.length > 0 ) {
      // determine closest intersection and highlight the respective 3D object
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }


private sortIntersections( a: { distance: number; }, b: { distance: number; } ) {
  return a.distance - b.distance;
}

  createControl() {
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.enablePan = false; 
    this.controls.enableRotate = false;


    this.renderer2.appendChild(this.rootdiv.nativeElement, this.renderer.domElement );
  }
  setCamera() {
    this.camera = new THREE.PerspectiveCamera( 70, this.canvas.clientWidth / (this.canvas.clientHeight*2), 1, 1000 );
		this.camera.position.set( 0, 0, -200 );
  }

  ngOnInit(): void {
  }

}
