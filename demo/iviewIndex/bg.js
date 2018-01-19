liziInit('demo');

function liziInit(elementId) {
    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    var SEPARATION = 90;
    var AMOUNTX = 50;
    var AMOUNTY = 50;
    var container;
    var particles, particle;
    var count;
    var camera;
    var scene;
    var renderer;
    var mouseX = 0;
    var mouseY = 0;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    init();
    var interval = setInterval(loop, 1000 / 60);

    function init() {
        container = document.createElement('div');
        container.style.position = 'relative';
        container.style.top = '200px';
        document.getElementById(elementId).appendChild(container);
        camera = new THREE.Camera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
        camera.position.z = 1000;
        scene = new THREE.Scene();
        renderer = new THREE.CanvasRenderer();
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        particles = new Array();
        var i = 0;
        var material = new THREE.ParticleCircleMaterial(0x097bdb, 1);
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                particle = particles[i++] = new THREE.Particle(material);
                particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
                particle.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
                scene.add(particle);
            }
        }
        count = 0;
        container.appendChild(renderer.domElement);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        //                    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    }

    function onDocumentMouseMove(event) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    function onDocumentTouchMove(event) {
        if (event.touches.length == 1) {
            event.preventDefault();
            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;
        }
    }

    function loop() {
        camera.position.x += (mouseX - camera.position.x) * .05;
        //                    camera.position.y += ( - mouseY - camera.position.y ) * .05;
        camera.position.y = 364;
        var i = 0;
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                particle = particles[i++];
                particle.position.y = (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50);
                particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;
            }
        }
        renderer.render(scene, camera);
        count += 0.1;
    }
};