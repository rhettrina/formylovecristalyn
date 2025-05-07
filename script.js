document.addEventListener('DOMContentLoaded', () => {

    // Adjust these two constants for your actual repo info:
    const GITHUB_USERNAME = "rhettrina";       // <= Palitan mo
    const GITHUB_REPO = "formylovecristalyn";         // <= Palitan mo
    const GITHUB_FOLDER = "images";            // folder ng images
  
    // Endpoint example:
    // https://api.github.com/repos/<username>/<repo>/contents/images
    const apiURL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${GITHUB_FOLDER}`;
  
    // DOM Elements
    const bgMusic = document.getElementById('bgMusic');
    const scrollDownBtn = document.getElementById('scrollDownBtn');
    const gallerySection = document.getElementById('gallerySection');
    const photosContainer = document.getElementById('photosContainer');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.querySelector('.lightbox .close');
  
    // 1) Scroll + Play Music
    scrollDownBtn.addEventListener('click', () => {
      bgMusic.play().catch(err => console.info('Autoplay blocked:', err));
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    });
  
    // 2) Fetch images from the GitHub API
    fetch(apiURL)
      .then(response => {
        if(!response.ok) {
          throw new Error("GitHub API request failed: " + response.status);
        }
        return response.json();
      })
      .then(files => {
        // 'files' is an array of objects { name, path, sha, size, url, type, ... }
        // Filter out directories, only show images
        const imageFiles = files.filter(file => {
          // type should be 'file' + extension check
          const isFile = file.type === 'file';
          const isImage = file.name.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/i);
          return isFile && isImage;
        });
  
        // Optional: randomize the order
        shuffle(imageFiles);
  
        // Build DOM for each file
        imageFiles.forEach(file => {
          const imgSrc = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/${GITHUB_FOLDER}/${file.name}`;
          // Note: trunk / main / master => depende sa default branch mo
  
          // Container
          const photoBox = document.createElement('div');
          photoBox.classList.add('photo-box');
  
          // Actual image
          const imgElem = document.createElement('img');
          imgElem.src = imgSrc;
          imgElem.alt = file.name;
  
          // Append
          photoBox.appendChild(imgElem);
          photosContainer.appendChild(photoBox);
  
          // Lightbox
          photoBox.addEventListener('click', () => {
            lightboxImg.src = imgSrc;
            lightbox.style.display = 'flex';
          });
        });
      })
      .catch(err => {
        console.error("Error fetching images from GitHub:", err);
        photosContainer.innerHTML = `<p style="color:red;">Error loading images. Check console.</p>`;
      });
  
    // 3) Lightbox close
    closeBtn.addEventListener('click', () => {
      lightbox.style.display = 'none';
    });
    lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox) {
        lightbox.style.display = 'none';
      }
    });
  
    // 4) Shuffle function (Fisher-Yates)
    function shuffle(array) {
      let currentIndex = array.length, randomIndex;
      while(currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
      return array;
    }
  });


  function createHeart() {
    const heartsContainer = document.getElementById('heartsContainer');
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.textContent = '❤';
  
    // Random na position sa x-axis
    heart.style.left = Math.random() * 100 + 'vw';
    // Random na laki
    heart.style.fontSize = (Math.floor(Math.random() * 20) + 20) + 'px';
    // Random na delay
    heart.style.animationDelay = Math.random() + 's';
  
    heartsContainer.appendChild(heart);
  
    // Tanggalin ang puso kapag tapos na ang animation
    setTimeout(() => {
      heart.remove();
    }, 10000); // kasabay ng animation duration
  }
  
  // Gumawa ng puso kada 0.6 second (halimbawa lang)
  setInterval(createHeart, 600);
  
  
  const heroContent = document.querySelector('.hero-content');
heroContent.addEventListener('mousemove', (e) => {
  const { offsetWidth, offsetHeight } = heroContent;
  const xPos = e.offsetX;
  const yPos = e.offsetY;
  // Paikutin nang kaunti based sa mouse position
  const rotateX = ((yPos / offsetHeight) - 0.5) * 8; 
  const rotateY = ((xPos / offsetWidth) - 0.5) * -8;

  heroContent.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});
heroContent.addEventListener('mouseleave', () => {
  heroContent.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
});
