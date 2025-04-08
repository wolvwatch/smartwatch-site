// PCBModel.js
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const PCBModel = () => {
  const mountRef = useRef(null);
  let model;

  useEffect(() => {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);


    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);


    const mtlLoader = new MTLLoader();
    mtlLoader.load('Smart_Watch_Final_3D.mtl', (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(
        'Smart_Watch_Final_3D.obj',
        (object) => {

          object.scale.set(0.5, 0.5, 0.5);

          model = object;
          scene.add(object);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('An error occurred loading the model:', error);
        }
      );
    });


    const animate = () => {
      requestAnimationFrame(animate);
      
      if (model) {

        model.rotation.y += 0.01;
      }
      
      renderer.render(scene, camera);
    };
    animate();


    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);


  return <div ref={mountRef} style={{ width: '100%', height: '70vh' }} />;
};

export default PCBModel;