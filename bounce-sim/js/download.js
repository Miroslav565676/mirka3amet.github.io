(function(){
  var dlTabs = document.querySelectorAll('.dl-tab');
  var dlBtn = document.getElementById('dlBtn');
  var dlMeta = document.getElementById('dlMeta');

  dlTabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      dlTabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      dlBtn.href = tab.getAttribute('data-url');
      dlBtn.innerHTML = '<span class="dl-icon">⬇</span> Скачать ' + (tab.getAttribute('data-label') || 'файл') + ' <span class="dl-meta">' + tab.getAttribute('data-sub') + '</span>';
    });
  });

  var htTabs = document.querySelectorAll('.ht-tab');
  htTabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      htTabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      var target = document.getElementById(tab.getAttribute('data-for'));
      document.querySelectorAll('.steps').forEach(function(s){ s.style.display = 'none'; });
      if (target) target.style.display = 'block';
    });
  });
})();