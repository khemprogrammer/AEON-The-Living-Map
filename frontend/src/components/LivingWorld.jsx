import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'
import seedrandom from 'seedrandom'

export default function LivingWorld({ world, forestCapMax = 6000, autoLOD = true, dreamsActive = 0, dreamsPostponed = 0, relationships = [] }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const animationRef = useRef(null)
  const meshRef = useRef(null)
  const waterRef = useRef(null)
  const treesRef = useRef({ trunk: null, canopy: null })
  const treeAnchorsRef = useRef([])
  const starsRef = useRef(null)
  const landmarksRef = useRef(null)
  const morphRef = useRef(null)
  const colorsRef = useRef(null)
  const baseColorRef = useRef(new THREE.Color(0x3355aa))
  const dynamicForestCapRef = useRef(forestCapMax)
  const fpsRef = useRef(60)
  const lastLodAdjustRef = useRef(0)
  const renderLandmarks = (relations) => {
    const scene = sceneRef.current
    const mesh = meshRef.current
    if (!scene || !mesh) return
    const geometry = mesh.geometry
    if (landmarksRef.current) {
      scene.remove(landmarksRef.current)
      landmarksRef.current.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose() } })
      landmarksRef.current = null
    }
    if (!relations || !relations.length) return
    const rngLocal = seedrandom(String(world?.terrain_seed || 42))
    const group = new THREE.Group()
    for (let i = 0; i < relations.length; i++) {
      const rel = relations[i] || {}
      const type = rel.type || 'family'
      const health = Math.max(0, Math.min(1, Number(rel.health ?? 0.5)))
      let idx = Math.floor(rngLocal() * geometry.attributes.position.count)
      let tries = 0
      while (tries < 200) {
        const z = geometry.attributes.position.getZ(idx)
        if (z > 0.3 && z < 2.2) break
        idx = Math.floor(rngLocal() * geometry.attributes.position.count)
        tries++
      }
      const x = geometry.attributes.position.getX(idx)
      const y = geometry.attributes.position.getY(idx)
      const z = geometry.attributes.position.getZ(idx)
      const base = new THREE.Group()
      const hue = 0.33 + 0.15 * health
      const col = new THREE.Color().setHSL(hue, 0.6, 0.45)
      if (type === 'family') {
        const bodyG = new THREE.BoxGeometry(1.0, 0.6 + health * 0.4, 0.8)
        const bodyM = new THREE.MeshStandardMaterial({ color: col })
        const body = new THREE.Mesh(bodyG, bodyM)
        body.position.y = z + (0.3 + health * 0.2)
        const roofG = new THREE.ConeGeometry(0.7, 0.4, 4)
        const roofM = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(hue, 0.6, Math.min(1, 0.55)) })
        const roof = new THREE.Mesh(roofG, roofM)
        roof.position.y = body.position.y + 0.5
        roof.rotation.y = Math.PI / 4
        base.add(body, roof)
      } else if (type === 'friendship') {
        const pillarG = new THREE.CylinderGeometry(0.08, 0.08, 0.8 + health * 0.3, 12)
        const pillarM = new THREE.MeshStandardMaterial({ color: col })
        const p1 = new THREE.Mesh(pillarG, pillarM)
        const p2 = new THREE.Mesh(pillarG, pillarM)
        p1.position.set(-0.4, z + 0.4, -0.2)
        p2.position.set(0.4, z + 0.4, 0.2)
        const deckG = new THREE.BoxGeometry(1.2, 0.1, 0.4)
        const deckM = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(hue, 0.6, Math.min(1, 0.55)) })
        const deck = new THREE.Mesh(deckG, deckM)
        deck.position.y = z + 0.75
        base.add(p1, p2, deck)
      } else {
        const towerG = new THREE.CylinderGeometry(0.15, 0.15, 1.2 + health * 0.6, 16)
        const towerM = new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(0xffffaa), emissiveIntensity: 0.3 + health * 0.5 })
        const tower = new THREE.Mesh(towerG, towerM)
        tower.position.y = z + 0.6
        const topG = new THREE.SphereGeometry(0.18, 12, 12)
        const topM = new THREE.MeshStandardMaterial({ color: 0xfff1a1, emissive: 0xfff1a1, emissiveIntensity: 0.6 + health * 0.4 })
        const top = new THREE.Mesh(topG, topM)
        top.position.y = tower.position.y + (0.6 + health * 0.3)
        base.add(tower, top)
      }
      base.position.set(x, 0, y)
      base.rotation.y = rngLocal() * Math.PI * 2
      group.add(base)
    }
    landmarksRef.current = group
    scene.add(group)
  }

  useEffect(() => {
    const mount = mountRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 20, 35)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    const hemi = new THREE.HemisphereLight(0x88aaff, 0x223355, 0.35)
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(20, 30, 10)
    scene.add(ambient, hemi, dir)

    const geometry = new THREE.PlaneGeometry(60, 60, 160, 160)
    const material = new THREE.MeshStandardMaterial({ color: 0x3366ff, wireframe: false, flatShading: true, vertexColors: true, metalness: 0.1, roughness: 0.8 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    scene.add(mesh)
    meshRef.current = mesh

    const rng = seedrandom(String(world?.terrain_seed || 42))
    const noise3D = createNoise3D(rng)
    const baseAmplitude = 3 + (world?.breakthroughs || 0) * 0.2
    const consistency = world?.habit_consistency ?? 0.5
    const stress = world?.stress_level ?? 0.5
    const neglect = world?.neglect ?? 0.0
    const jaggedness = 0.6 + stress * 0.8
    const baseColor = new THREE.Color().setHSL(0.6 - consistency * 0.35, 0.7, 0.45 - neglect * 0.25)
    material.color = baseColor
    baseColorRef.current = baseColor.clone()
    scene.fog = new THREE.Fog(baseColor.clone().multiplyScalar(0.5), 40, 120)

    const colors = new Float32Array(geometry.attributes.position.count * 3)
    colorsRef.current = colors
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const x = geometry.attributes.position.getX(i)
      const y = geometry.attributes.position.getY(i)
      const n = noise3D(x * 0.06, y * 0.06, 0) * baseAmplitude
      const j = noise3D(x * 0.2, y * 0.2, 10) * jaggedness
      const h = n + j * 0.6
      geometry.attributes.position.setZ(i, h)
      const t = (h + 6) / 12
      const c = new THREE.Color().setHSL(0.6 - t * 0.4, 0.7, 0.35 + t * 0.25)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
    geometry.computeVertexNormals()

    const waterGeom = new THREE.PlaneGeometry(62, 62, 1, 1)
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, transparent: true, opacity: 0.6 })
    const water = new THREE.Mesh(waterGeom, waterMat)
    water.rotation.x = -Math.PI / 2
    water.position.y = -0.8
    scene.add(water)
    waterRef.current = water

    const buildStars = (rngLocal) => {
      if (starsRef.current) scene.remove(starsRef.current)
      const a = Number(dreamsActive || world?.sky_active_goals || 0)
      const p = Number(dreamsPostponed || world?.sky_postponed_goals || 0)
      const baseCount = 1000
      const starCount = Math.max(200, Math.min(3000, Math.floor(baseCount + a * 150 - p * 100)))
      const positions = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount; i++) {
        const theta = rngLocal() * Math.PI * 2
        const phi = Math.acos(rngLocal() * 2 - 1)
        const r = 220 + rngLocal() * 30
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = r * Math.cos(phi)
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      }
      const starGeo = new THREE.BufferGeometry()
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const sizeBase = 0.4 + Math.max(0, a) * 0.05 - Math.max(0, p) * 0.03
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: Math.max(0.2, Math.min(1.2, sizeBase)), sizeAttenuation: true })
      starMat.fog = false
      const stars = new THREE.Points(starGeo, starMat)
      starsRef.current = stars
      scene.add(stars)
    }
    buildStars(rng)

    renderLandmarks(relationships)

    const buildTrees = (rngLocal, noiseFn, cap) => {
      if (treesRef.current.trunk) {
        scene.remove(treesRef.current.trunk)
        scene.remove(treesRef.current.canopy)
        treesRef.current.trunk.geometry.dispose()
        treesRef.current.trunk.material.dispose()
        treesRef.current.canopy.geometry.dispose()
        treesRef.current.canopy.material.dispose()
        treesRef.current = { trunk: null, canopy: null }
      }
      treeAnchorsRef.current = []
      const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a29, roughness: 1 })
      const canopyGeo = new THREE.ConeGeometry(0.4, 1.0, 8)
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2b8a3e, roughness: 0.9 })
      const maxTrees = Math.max(0, Math.floor(cap || 0))
      const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, maxTrees)
      const canopyMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, maxTrees)
      let placed = 0
      const m4 = new THREE.Matrix4()
      for (let i = 0; i < geometry.attributes.position.count && placed < maxTrees; i++) {
        const x = geometry.attributes.position.getX(i)
        const y = geometry.attributes.position.getY(i)
        const n = noiseFn(x * 0.06, y * 0.06, 0) * baseAmplitude
        const j = noiseFn(x * 0.2, y * 0.2, 10) * jaggedness
        const h = n + j * 0.6
        const eps = 0.25
        const nx1 = noiseFn((x + eps) * 0.06, y * 0.06, 0) * baseAmplitude + noiseFn((x + eps) * 0.2, y * 0.2, 10) * jaggedness * 0.6
        const nx2 = noiseFn((x - eps) * 0.06, y * 0.06, 0) * baseAmplitude + noiseFn((x - eps) * 0.2, y * 0.2, 10) * jaggedness * 0.6
        if (h > 1.6 && h > nx1 && h > nx2 && rngLocal() > 0.4) {
          const yaw = rngLocal() * Math.PI * 2
          const scale = 0.8 + rngLocal() * 0.6
          m4.makeRotationY(yaw)
          m4.setPosition(x, h, y)
          const s = new THREE.Matrix4().makeScale(1, scale, 1)
          trunkMesh.setMatrixAt(placed, m4.clone().multiply(s))
          const canopyMatrix = m4.clone()
          canopyMatrix.multiply(new THREE.Matrix4().makeTranslation(0, 0.8 * scale, 0))
          canopyMesh.setMatrixAt(placed, canopyMatrix)
          treeAnchorsRef.current.push({ idx: i, yaw, scale })
          placed++
        }
      }
      trunkMesh.count = placed
      canopyMesh.count = placed
      trunkMesh.instanceMatrix.needsUpdate = true
      canopyMesh.instanceMatrix.needsUpdate = true
      treesRef.current = { trunk: trunkMesh, canopy: canopyMesh }
      scene.add(trunkMesh, canopyMesh)
    }
    buildTrees(rng, noise3D, dynamicForestCapRef.current)

    const clock = new THREE.Clock()
    const animate = () => {
      const dt = clock.getDelta()
      const t = clock.elapsedTime
      const now = performance.now()
      const fps = 1 / Math.max(dt, 1e-6)
      fpsRef.current = fpsRef.current * 0.9 + fps * 0.1
      mesh.position.y = Math.sin(t * 0.6) * 0.2
      if (waterRef.current) waterRef.current.position.y = -0.8 + Math.sin(t * 0.8) * 0.05

      if (morphRef.current) {
        const { start, duration, fromZ, toZ, ease, targetBaseColor, onComplete } = morphRef.current
        const elapsed = (performance.now() - start) / 1000
        const k = Math.min(1, elapsed / duration)
        const e = ease(k)
        const pos = geometry.attributes.position
        const colors = colorsRef.current
        for (let i = 0; i < pos.count; i++) {
          const z = fromZ[i] + (toZ[i] - fromZ[i]) * e
          pos.setZ(i, z)
          const tn = (z + 6) / 12
          const c = new THREE.Color().setHSL(0.6 - tn * 0.4, 0.7, 0.35 + tn * 0.25)
          colors[i * 3] = c.r
          colors[i * 3 + 1] = c.g
          colors[i * 3 + 2] = c.b
        }
        pos.needsUpdate = true
        geometry.attributes.color.needsUpdate = true
        geometry.computeVertexNormals()
        const bc = baseColorRef.current.clone().lerp(targetBaseColor, e)
        material.color.copy(bc)
        scene.fog.color.copy(bc.clone().multiplyScalar(0.5))
        if (treesRef.current.trunk && treeAnchorsRef.current.length) {
          const trunkMesh = treesRef.current.trunk
          const canopyMesh = treesRef.current.canopy
          const m4 = new THREE.Matrix4()
          for (let t = 0; t < treeAnchorsRef.current.length; t++) {
            const { idx, yaw, scale } = treeAnchorsRef.current[t]
            const tx = geometry.attributes.position.getX(idx)
            const ty = geometry.attributes.position.getY(idx)
            const tz = geometry.attributes.position.getZ(idx)
            const rotY = new THREE.Matrix4().makeRotationY(yaw)
            const trans = new THREE.Matrix4().makeTranslation(tx, tz, ty)
            const scl = new THREE.Matrix4().makeScale(1, scale, 1)
            trunkMesh.setMatrixAt(t, new THREE.Matrix4().multiply(trans).multiply(rotY).multiply(scl))
            const canopyMatrix = new THREE.Matrix4().multiply(trans).multiply(rotY).multiply(new THREE.Matrix4().makeTranslation(0, 0.8 * scale, 0))
            canopyMesh.setMatrixAt(t, canopyMatrix)
          }
          treesRef.current.trunk.instanceMatrix.needsUpdate = true
          treesRef.current.canopy.instanceMatrix.needsUpdate = true
        }
        if (k >= 1) {
          baseColorRef.current = targetBaseColor
          if (onComplete) onComplete()
          morphRef.current = null
        }
      }
      if (!morphRef.current && autoLOD && treesRef.current.trunk) {
        const upper = 55
        const lower = 40
        const step = 200
        const minCap = 200
        const lastAdjust = lastLodAdjustRef.current
        if (now - lastAdjust > 1500) {
          let cap = dynamicForestCapRef.current
          if (fpsRef.current > upper && cap < forestCapMax) cap = Math.min(forestCapMax, cap + step)
          else if (fpsRef.current < lower && cap > minCap) cap = Math.max(minCap, cap - step)
          if (cap !== dynamicForestCapRef.current) {
            dynamicForestCapRef.current = cap
            buildTrees(rng, noise3D, cap)
            lastLodAdjustRef.current = now
          }
        }
      }

      renderer.render(scene, camera)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    sceneRef.current = scene
    rendererRef.current = renderer
    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current || !meshRef.current || !world) return
    const geometry = meshRef.current.geometry
    const duration = 1.0
    const rng = seedrandom(String(world.terrain_seed || 42))
    const noise3D = createNoise3D(rng)
    const baseAmplitude = 3 + (world.breakthroughs || 0) * 0.2
    const consistency = world.habit_consistency ?? 0.5
    const stress = world.stress_level ?? 0.5
    const neglect = world.neglect ?? 0.0
    const jaggedness = 0.6 + stress * 0.8
    const targetBaseColor = new THREE.Color().setHSL(0.6 - consistency * 0.35, 0.7, 0.45 - neglect * 0.25)
    const toZ = new Float32Array(geometry.attributes.position.count)
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const x = geometry.attributes.position.getX(i)
      const y = geometry.attributes.position.getY(i)
      const n = noise3D(x * 0.06, y * 0.06, 0) * baseAmplitude
      const j = noise3D(x * 0.2, y * 0.2, 10) * jaggedness
      toZ[i] = n + j * 0.6
    }
    const fromZ = new Float32Array(geometry.attributes.position.count)
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      fromZ[i] = geometry.attributes.position.getZ(i)
    }
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    morphRef.current = {
      start: performance.now(),
      duration,
      fromZ,
      toZ,
      ease,
      targetBaseColor,
      onComplete: () => {
        const scene = sceneRef.current
        const rebuildRNG = seedrandom(String(world.terrain_seed || 42))
        const rebuildNoise = createNoise3D(rebuildRNG)
        if (starsRef.current) {
          scene.remove(starsRef.current)
          starsRef.current.geometry.dispose()
          starsRef.current.material.dispose()
          starsRef.current = null
        }
        const a = Number(dreamsActive || world.sky_active_goals || 0)
        const p = Number(dreamsPostponed || world.sky_postponed_goals || 0)
        const baseCount = 1000
        const starCount = Math.max(200, Math.min(3000, Math.floor(baseCount + a * 150 - p * 100)))
        const positions = new Float32Array(starCount * 3)
        for (let i = 0; i < starCount; i++) {
          const theta = rebuildRNG() * Math.PI * 2
          const phi = Math.acos(rebuildRNG() * 2 - 1)
          const r = 220 + rebuildRNG() * 30
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
          positions[i * 3 + 1] = r * Math.cos(phi)
          positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
        }
        const starGeo = new THREE.BufferGeometry()
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const sizeBase = 0.4 + Math.max(0, a) * 0.05 - Math.max(0, p) * 0.03
        const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: Math.max(0.2, Math.min(1.2, sizeBase)), sizeAttenuation: true })
        starMat.fog = false
        const stars = new THREE.Points(starGeo, starMat)
        starsRef.current = stars
        scene.add(stars)
        if (treesRef.current.trunk) {
          scene.remove(treesRef.current.trunk)
          scene.remove(treesRef.current.canopy)
          treesRef.current.trunk.geometry.dispose()
          treesRef.current.trunk.material.dispose()
          treesRef.current.canopy.geometry.dispose()
          treesRef.current.canopy.material.dispose()
          treesRef.current = { trunk: null, canopy: null }
        }
        const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6)
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a29, roughness: 1 })
        const canopyGeo = new THREE.ConeGeometry(0.4, 1.0, 8)
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2b8a3e, roughness: 0.9 })
        const maxTrees = Math.max(0, Math.floor(dynamicForestCapRef.current || 0))
        const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, maxTrees)
        const canopyMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, maxTrees)
        let placed = 0
        const m4 = new THREE.Matrix4()
        treeAnchorsRef.current = []
        for (let i = 0; i < geometry.attributes.position.count && placed < maxTrees; i++) {
          const x = geometry.attributes.position.getX(i)
          const y = geometry.attributes.position.getY(i)
          const h = toZ[i]
          const eps = 0.25
          const nx1 = rebuildNoise((x + eps) * 0.06, y * 0.06, 0) * baseAmplitude + rebuildNoise((x + eps) * 0.2, y * 0.2, 10) * jaggedness * 0.6
          const nx2 = rebuildNoise((x - eps) * 0.06, y * 0.06, 0) * baseAmplitude + rebuildNoise((x - eps) * 0.2, y * 0.2, 10) * jaggedness * 0.6
          if (h > 1.6 && h > nx1 && h > nx2 && rebuildRNG() > 0.4) {
            const yaw = rebuildRNG() * Math.PI * 2
            const scale = 0.8 + rebuildRNG() * 0.6
            m4.makeRotationY(yaw)
            m4.setPosition(x, h, y)
            const s = new THREE.Matrix4().makeScale(1, scale, 1)
            trunkMesh.setMatrixAt(placed, m4.clone().multiply(s))
            const canopyMatrix = m4.clone()
            canopyMatrix.multiply(new THREE.Matrix4().makeTranslation(0, 0.8 * scale, 0))
            canopyMesh.setMatrixAt(placed, canopyMatrix)
            treeAnchorsRef.current.push({ idx: i, yaw, scale })
            placed++
          }
        }
        trunkMesh.count = placed
        canopyMesh.count = placed
        trunkMesh.instanceMatrix.needsUpdate = true
        canopyMesh.instanceMatrix.needsUpdate = true
        treesRef.current = { trunk: trunkMesh, canopy: canopyMesh }
        scene.add(trunkMesh, canopyMesh)
        renderLandmarks(relationships)
      }
    }
  }, [world?.terrain_seed, world?.breakthroughs, world?.habit_consistency, world?.stress_level, world?.neglect, forestCapMax, autoLOD])

  useEffect(() => {
    if (!sceneRef.current || !meshRef.current || !world) return
    const scene = sceneRef.current
    const geometry = meshRef.current.geometry
    const rng = seedrandom(String(world.terrain_seed || 42))
    const noise3D = createNoise3D(rng)
    const baseAmplitude = 3 + (world.breakthroughs || 0) * 0.2
    const stress = world.stress_level ?? 0.5
    const jaggedness = 0.6 + stress * 0.8
    dynamicForestCapRef.current = autoLOD ? Math.min(dynamicForestCapRef.current, forestCapMax) : forestCapMax
    if (treesRef.current.trunk) {
      scene.remove(treesRef.current.trunk)
      scene.remove(treesRef.current.canopy)
      treesRef.current.trunk.geometry.dispose()
      treesRef.current.trunk.material.dispose()
      treesRef.current.canopy.geometry.dispose()
      treesRef.current.canopy.material.dispose()
      treesRef.current = { trunk: null, canopy: null }
    }
    treeAnchorsRef.current = []
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a29, roughness: 1 })
    const canopyGeo = new THREE.ConeGeometry(0.4, 1.0, 8)
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2b8a3e, roughness: 0.9 })
    const maxTrees = Math.max(0, Math.floor(dynamicForestCapRef.current || 0))
    const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, maxTrees)
    const canopyMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, maxTrees)
    let placed = 0
    const m4 = new THREE.Matrix4()
    for (let i = 0; i < geometry.attributes.position.count && placed < maxTrees; i++) {
      const x = geometry.attributes.position.getX(i)
      const y = geometry.attributes.position.getY(i)
      const n = noise3D(x * 0.06, y * 0.06, 0) * baseAmplitude
      const j = noise3D(x * 0.2, y * 0.2, 10) * jaggedness
      const h = n + j * 0.6
      const eps = 0.25
      const nx1 = noise3D((x + eps) * 0.06, y * 0.06, 0) * baseAmplitude + noise3D((x + eps) * 0.2, y * 0.2, 10) * jaggedness * 0.6
      const nx2 = noise3D((x - eps) * 0.06, y * 0.06, 0) * baseAmplitude + noise3D((x - eps) * 0.2, y * 0.2, 10) * jaggedness * 0.6
      if (h > 1.6 && h > nx1 && h > nx2 && rng() > 0.4) {
        const yaw = rng() * Math.PI * 2
        const scale = 0.8 + rng() * 0.6
        m4.makeRotationY(yaw)
        m4.setPosition(x, h, y)
        const s = new THREE.Matrix4().makeScale(1, scale, 1)
        trunkMesh.setMatrixAt(placed, m4.clone().multiply(s))
        const canopyMatrix = m4.clone()
        canopyMatrix.multiply(new THREE.Matrix4().makeTranslation(0, 0.8 * scale, 0))
        canopyMesh.setMatrixAt(placed, canopyMatrix)
        treeAnchorsRef.current.push({ idx: i, yaw, scale })
        placed++
      }
    }
    trunkMesh.count = placed
    canopyMesh.count = placed
    trunkMesh.instanceMatrix.needsUpdate = true
    canopyMesh.instanceMatrix.needsUpdate = true
    treesRef.current = { trunk: trunkMesh, canopy: canopyMesh }
    scene.add(trunkMesh, canopyMesh)
  }, [forestCapMax, autoLOD])

  useEffect(() => {
    renderLandmarks(relationships)
  }, [relationships?.length])

  return <div ref={mountRef} className="w-full h-[70vh] bg-slate-900 rounded-md shadow-inner" />
}
