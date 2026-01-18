if (typeof document !== 'undefined') {
  document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();


    const product = {
      name: document.getElementById("name").value.trim(),
      category: document.getElementById("category").value.trim(),
      price: document.getElementById("price").value,
      description: document.getElementById("description").value.trim(),
      image: document.getElementById("image").value.trim(),
      image2: document.getElementById("image2").value.trim(),
      quantity: document.getElementById("quantity")?.value || 0
    };
    try {
      const res = await fetch('/api/client/products', {  // POST to backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Product added!');
        window.location.href = '/products.html'; // redirect frontend products page
      } else {
        alert(data.message || 'Failed to add product');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  });
}
//list//
const productList = document.getElementById("productList");

//delete
async function deleteProduct(id) {
  if (!confirm('Delete product?')) return;

  await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  loadProducts();
}

// Load products from backend
async function loadProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/products'); // backend endpoint
    if (!res.ok) throw new Error('Failed to fetch products');

    const products = await res.json();

    const container = document.getElementById('products-container');
    container.innerHTML = ''; // clear before adding

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.image || '/images/default.jpg'}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>Price: ${p.price}</p>
        <p>Quantity: ${p.quantity}</p>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    document.getElementById('products-container').innerHTML =
      '<p>Failed to load products.</p>';
  }
}

// Call on page load
window.addEventListener('DOMContentLoaded', loadProducts);

// Optional: auto refresh every 10 seconds
// setInterval(loadProducts, 10000);
//update
async function updateProduct(id) {
  const name = prompt('New name:');
  const price = parseFloat(prompt('New price:'));
  const category = prompt('New category:');
  const image = prompt('New image URL:');
  const quantity = parseInt(prompt('New quantity:'));
  if (!name || isNaN(price) || !category || !image || isNaN(quantity)) {
    alert('Invalid input');
    return;
  }

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, category, image, quantity })
    });

    if (res.ok) {
      alert('Product updated!');
      loadProducts();
    } else {
      alert('Failed to update product');
    }
  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}

//cube animantion
const regl = createREGL({ 
  container: document.querySelector("#display"),
  extensions: ["ANGLE_instanced_arrays"]
});
const { mat4 } = glMatrix;

// Геометрия куба с правильными вершинами для каждой грани
const cubeVertices = [
  // Передняя грань
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5],
  [-0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5],
  
  // Задняя грань
  [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5],
  [0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5],
  
  // Нижняя грань
  [-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5],
  [-0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, -0.5, -0.5],
  
  // Верхняя грань
  [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5],
  [-0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5],
  
  // Левая грань
  [-0.5, -0.5, 0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, 0.5, 0.5],
  
  // Правая грань
  [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5],
  [0.5, -0.5, -0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5]
];

// Правильные нормали для каждой грани
const cubeNormals = [
  // Передняя грань
  [0, 0, -1], [0, 0, -1], [0, 0, -1],
  [0, 0, -1], [0, 0, -1], [0, 0, -1],
  
  // Задняя грань
  [0, 0, 1], [0, 0, 1], [0, 0, 1],
  [0, 0, 1], [0, 0, 1], [0, 0, 1],
  
  // Нижняя грань
  [0, -1, 0], [0, -1, 0], [0, -1, 0],
  [0, -1, 0], [0, -1, 0], [0, -1, 0],
  
  // Верхняя грань
  [0, 1, 0], [0, 1, 0], [0, 1, 0],
  [0, 1, 0], [0, 1, 0], [0, 1, 0],
  
  // Левая грань
  [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
  [-1, 0, 0], [-1, 0, 0], [-1, 0, 0],
  
  // Правая грань
  [1, 0, 0], [1, 0, 0], [1, 0, 0],
  [1, 0, 0], [1, 0, 0], [1, 0, 0]
];

// Исправляем UV координаты - нужно добавить координаты для всех граней
const cubeUvs = [
  // Передняя грань
  [0, 0], [1, 0], [1, 1],
  [0, 0], [1, 1], [0, 1],
  
  // Задняя грань
  [0, 0], [1, 0], [1, 1],
  [0, 0], [1, 1], [0, 1],
  
  // Нижняя грань
  [0, 0], [1, 0], [1, 1],
  [0, 0], [1, 1], [0, 1],
  
  // Верхняя грань
  [0, 0], [1, 0], [1, 1],
  [0, 0], [1, 1], [0, 1],
  
  // Левая грань
  [0, 0], [1, 0], [1, 1],
  [0, 0], [1, 1], [0, 1],
  
  // Правая грань
  [0, 0], [1, 0], [1, 1],
  [0, 0], [1, 1], [0, 1]
];

// Обновляем объект cube
const cube = {
  position: regl.buffer(cubeVertices),
  normals: regl.buffer(cubeNormals),
  uvs: regl.buffer(cubeUvs),
  count: cubeVertices.length
};

const SIZE = 6;

const count = Math.pow(SIZE, 3);

const getPos = (i) => {
  const size = SIZE;
  const x = i % size;
  const y = Math.floor(i / size) % size;
  const z = Math.floor(i / (size * size));
  return [x - 2.5, y - 2.5, z - 2.5];
}

const getRandomPos = (i) => {
  const size = 5;
  const pos = getPos(i);
  const x = pos[0] * Math.random() * size;
  const y = pos[1] * Math.random() * size;
  const z = pos[2] * Math.random() * size;
  return [x, y, z];
}

const getColor = (pos) => {
  const [x, y, z] = pos;
  return [
      (z / 2) % 2,
      1,
      (y / 2) % 2,
    ]
}

// Данные для инстансов (массив кубиков)
const instances = Array(count).fill().map((_, i) => {
  
  const cubicPos = getPos(i);
  const randomPos = getRandomPos(i);
  
  return {
    position: cubicPos,
    randomPos: randomPos,
    rotation: [
      0,
      0,
      0
    ],
    color: getColor(cubicPos),
    scale: 0.5
  }
})

// Буферы для данных инстансов
const instanceBuffers = {
  position: regl.buffer(instances.map(i => i.position)),
  position2: regl.buffer(instances.map(i => i.randomPos)),
  rotation: regl.buffer(instances.map(i => i.rotation)),
  color: regl.buffer(instances.map(i => i.color)),
  scale: regl.buffer(instances.map(i => [i.scale]))
}

// Команда отрисовки с инстансингом
const drawCubes = regl({
  vert: `
  precision mediump float;
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;
  attribute vec3 instancePosition;
  attribute vec3 instancePosition2;
  attribute vec3 instanceRotation;
  attribute vec3 instanceColor;
  attribute float instanceScale;

  uniform mat4 projection, view;
  uniform float time;

  varying vec3 vNormal, vPosition, vColor;
  varying vec2 vUv;

  mat4 rotationX(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat4(
      1, 0, 0, 0,
      0, c, -s, 0,
      0, s, c, 0,
      0, 0, 0, 1
    );
  }

  mat4 rotationY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat4(
      c, 0, s, 0,
      0, 1, 0, 0,
      -s, 0, c, 0,
      0, 0, 0, 1
    );
  }

  mat4 rotationZ(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat4(
      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }

  void main() {
    vColor = instanceColor;
    vUv = uv;

    mat4 model = mat4(1.0);
    float anim = pow(sin(time) * .5 + .5, 16.);
    model[3].xyz = mix(instancePosition, instancePosition2, anim);
    model = model * rotationX(instanceRotation.x);
    model = model * rotationY(instanceRotation.y);
    model = model * rotationZ(instanceRotation.z);
    model[0] *= instanceScale;
    model[1] *= instanceScale;
    model[2] *= instanceScale;

    // Правильное преобразование нормалей с учетом масштабирования
    mat3 normalMatrix = mat3(
      model[0].xyz / (instanceScale * instanceScale),
      model[1].xyz / (instanceScale * instanceScale),
      model[2].xyz / (instanceScale * instanceScale)
    );
    vNormal = normalMatrix * normal;

    vPosition = (model * vec4(position, 1.0)).xyz;

    gl_Position = projection * view * model * vec4(position, 1);
  }
  `,

  frag: `
  precision mediump float;
  varying vec3 vNormal, vPosition, vColor;
  varying vec2 vUv;

  uniform vec3 lightPosition;
  uniform vec3 lightColor;
  uniform float lightIntensity;
  uniform vec3 ambientColor;
  uniform float specularPower;
  uniform mat4 view;

  void main() {
    // Нормализуем нормаль и направление к свету
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPosition - vPosition);
    vec3 viewPosition = view[0].xyz;

    // Диффузное освещение
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = lightColor * diff * lightIntensity;
    vec2 cuv = abs(vUv - vec2(0.5));
    float centerDist = length(cuv) * 2.;
    
    vec3 viewDir = normalize(viewPosition - vPosition);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), specularPower);
    vec3 specular = vec3(1., 0.25, 0.1) * spec * lightIntensity;

    // Общее освещение (диффузное + ambient)
    vec3 lighting = ambientColor + diffuse + specular;

    // Применяем освещение к цвету
    vec3 result = (vColor) * (lighting * (1. - centerDist + 0.5));
    
    float alpha = smoothstep(0.3, 0.3, max(cuv.x, cuv.y));
    
    result = (vColor) * (lighting * (1. - centerDist + 0.5)) * alpha;

    gl_FragColor = vec4(result, alpha);
  }
  `,

  attributes: {
    position: cube.position,
    normal: cube.normals,
    uv: cube.uvs,

    instancePosition: {
      buffer: instanceBuffers.position,
      divisor: 1
    },
    instancePosition2: {
      buffer: instanceBuffers.position2,
      divisor: 1
    },
    instanceRotation: {
      buffer: instanceBuffers.rotation,
      divisor: 1
    },
    instanceColor: {
      buffer: instanceBuffers.color,
      divisor: 1
    },
    instanceScale: {
      buffer: instanceBuffers.scale,
      divisor: 1
    }
  },

  count: cube.count,
  instances: instances.length,

  uniforms: {
    lightPosition: [0, 0, 0],
    lightColor: [1, 0, 0.5],
    lightIntensity: 2.0,
    ambientColor: [0.1, 0., 0.1],
    specularPower: 3.0,
    
    time: () => performance.now() * 0.0001,
    
    view: ({tick}) => {
      const t = performance.now() * 0.0001
      const a = Math.pow(Math.sin(t) + 0.5 * 0.5, 16) * 0.1 + (t);
      
      return mat4.lookAt(
        mat4.create(),
        [10 * Math.cos(a), 10 * Math.cos(a), 10 * Math.sin(a)],
        [0, 0, 0],
        [0, 1, 0]
      )
    },
    projection: ({viewportWidth, viewportHeight}) => 
      mat4.perspective(
        mat4.create(),
        Math.PI/4,
        viewportWidth / viewportHeight,
        0.01,
        1000
      )
  },
  
  blend: {
    enable: true,
    func: {
      srcRGB: "src alpha",
      srcAlpha: "src alpha",
      dstRGB: "one minus src alpha",
      dstAlpha: "one minus src alpha"
    }
  },
})

regl.frame(({tick}) => {
  const t = performance.now() * 0.001
  
  instances.forEach((inst, i) => {
    // inst.rotation[0] = 0.01 * tick + i * 0.1
    inst.rotation[1] = t
  })
  
  instanceBuffers.rotation.subdata(instances.map(i => i.rotation))
  
  regl.clear({
    depth: 1,
    color: [0, 0, 0, 1]
  })
  drawCubes()
})