import sys

with open('index.html', 'r') as f:
    content = f.read()

# Step 1: Insert the modal HTML
marker = 'confirmTikDown()">View on GitHub</button>\n            </div>\n        </div>\n    </div>\n\n    \n    <script>'
idx = content.find(marker)
print(f'marker found at: {idx}', file=sys.stderr)

if idx >= 0:
    modal_html = '''confirmTikDown()">View on GitHub</button>
            </div>
        </div>
    </div>

    <!-- ShadowMind Project Modal -->
    <div class="sayit-modal-overlay" id="shadowMindModal">
        <div class="sayit-modal" style="max-width:620px;padding:2rem 1.5rem 5rem;">
            <div class="shadowmind-carousel" id="shadowmindCarousel">
                <img src="shadowmind.png" alt="ShadowMind cover" class="active">
                <img src="shadowmind1.png" alt="ShadowMind screenshot 1">
                <img src="shadowmind2.png" alt="ShadowMind screenshot 2">
            </div>
            <div class="sayit-modal-title" style="font-size:1.3rem;margin-bottom:0.5rem;">ShadowMind</div>
            <p class="sayit-modal-text" style="text-align:center;margin-bottom:1rem;">
                Next-generation note-taking platform.
            </p>
            <div class="shadowmind-features">
                <div class="shadowmind-feature">
                    <i class="fas fa-pen-fancy"></i>
                    <span>Rich editing<br>text, colors, images, audio, tables</span>
                </div>
                <div class="shadowmind-feature">
                    <i class="fas fa-volume-up"></i>
                    <span>Text-to-speech<br>French &amp; English</span>
                </div>
                <div class="shadowmind-feature">
                    <i class="fas fa-sync-alt"></i>
                    <span>Synced notes<br>available on all your devices</span>
                </div>
                <div class="shadowmind-feature">
                    <i class="fas fa-shield-alt"></i>
                    <span>Secure storage<br>end-to-end encrypted</span>
                </div>
            </div>
            <div class="sayit-modal-buttons" style="position:absolute;bottom:1.5rem;left:0;right:0;display:flex;gap:12px;justify-content:center;z-index:10;">
                <button class="sayit-btn sayit-btn-cancel" onclick="closeShadowMindModal()">Close</button>
                <button class="sayit-btn sayit-btn-confirm btn-outline" onclick="confirmShadowMind()">Open website</button>
            </div>
        </div>
    </div>


    <script>'''

    content = content[:idx] + modal_html + content[idx + len(marker):]
    print('Step 1: Inserted shadowmind modal HTML.', file=sys.stderr)
else:
    print('Marker not found for step 1!', file=sys.stderr)

# Step 2: Insert the JS functions before </script>
js_marker = "document.getElementById('tikDownModal').addEventListener('click', function(e) {\n            if (e.target === this) closeTikDownModal();\n        });\n    </script>"
idx2 = content.find(js_marker)
print(f'JS marker found at: {idx2}', file=sys.stderr)

if idx2 >= 0:
    js_code = """document.getElementById('tikDownModal').addEventListener('click', function(e) {
            if (e.target === this) closeTikDownModal();
        });

        /* ── ShadowMind Modal ── */
        var shadowMindInterval, shadowMindIndex = 0;
        var shadowMindImages = ['shadowmind.png', 'shadowmind1.png', 'shadowmind2.png'];

        function showShadowMindModal() {
            document.body.style.overflow = 'hidden';
            var modal = document.getElementById('shadowMindModal');
            modal.classList.add('active');
            shadowMindIndex = 0;
            var imgs = document.querySelectorAll('#shadowmindCarousel img');
            imgs.forEach(function(img, i) {
                img.classList.toggle('active', i === 0);
                img.style.transform = '';
                img.style.transition = 'none';
            });
            clearInterval(shadowMindInterval);
            shadowMindInterval = setInterval(function() {
                shadowMindIndex = (shadowMindIndex + 1) % shadowMindImages.length;
                var imgs = document.querySelectorAll('#shadowmindCarousel img');
                var prev = shadowMindIndex === 0 ? imgs.length - 1 : shadowMindIndex - 1;
                imgs[prev].style.transition = 'transform 0.6s ease';
                imgs[prev].style.transform = 'translateX(-100%)';
                imgs[prev].classList.remove('active');
                imgs[shadowMindIndex].style.transition = 'none';
                imgs[shadowMindIndex].style.transform = 'translateX(100%)';
                imgs[shadowMindIndex].classList.add('active');
                void imgs[shadowMindIndex].offsetHeight;
                imgs[shadowMindIndex].style.transition = 'transform 0.6s ease';
                imgs[shadowMindIndex].style.transform = 'translateX(0)';
                setTimeout(function() {
                    imgs[prev].style.transition = 'none';
                    imgs[prev].style.transform = '';
                }, 600);
            }, 4000);
        }

        function closeShadowMindModal() {
            document.body.style.overflow = '';
            clearInterval(shadowMindInterval);
            document.getElementById('shadowMindModal').classList.remove('active');
        }

        function confirmShadowMind() {
            closeShadowMindModal();
            window.open('https://shadowmind.gt.tc/', '_blank');
        }

        document.getElementById('shadowMindModal').addEventListener('click', function(e) {
            if (e.target === this) closeShadowMindModal();
        });
    </script>"""

    content = content[:idx2] + js_code + content[idx2 + len(js_marker):]
    print('Step 2: Inserted JS functions.', file=sys.stderr)
else:
    print('JS marker not found for step 2!', file=sys.stderr)

with open('index.html', 'w') as f:
    f.write(content)
print('Done!', file=sys.stderr)
