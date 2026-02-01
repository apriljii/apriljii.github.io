// A local search script with the help of
// [hexo-generator-search](https://github.com/PaicHyperionDev/hexo-generator-search)
// Copyright (C) 2015
// Joseph Pan <http://github.com/wzpan>
// Shuhao Mao <http://github.com/maoshuhao>
// This library is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation; either version 2.1 of the
// License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
// 02110-1301 USA
//
// Modified by:
// Pieter Robberechts <http://github.com/probberechts>

/*exported searchFunc*/
var searchFunc = function(path, searchId, contentId) {

  // 搜索历史和热门关键词管理
  var searchHistory = {
    get: function() {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    },
    add: function(keyword) {
      if (!keyword || keyword.trim().length === 0) return;
      var history = this.get();
      var index = history.indexOf(keyword);
      if (index > -1) {
        history.splice(index, 1);
      }
      history.unshift(keyword);
      history = history.slice(0, 8); // 保留最近8个
      localStorage.setItem('searchHistory', JSON.stringify(history));
    },
    clear: function() {
      localStorage.removeItem('searchHistory');
    }
  };

  var popularKeywords = [
    'JavaScript', 'Vue.js', 'CSS', 'React', '前端开发',
    '性能优化', 'TypeScript', 'Node.js', 'Webpack'
  ];

  function stripHtml(html) {
    html = html.replace(/<style([\s\S]*?)<\/style>/gi, "");
    html = html.replace(/<script([\s\S]*?)<\/script>/gi, "");
    html = html.replace(/<figure([\s\S]*?)<\/figure>/gi, "");
    html = html.replace(/<\/div>/ig, "\n");
    html = html.replace(/<\/li>/ig, "\n");
    html = html.replace(/<li>/ig, "  *  ");
    html = html.replace(/<\/ul>/ig, "\n");
    html = html.replace(/<\/p>/ig, "\n");
    html = html.replace(/<br\s*[\/]?>/gi, "\n");
    html = html.replace(/<[^>]+>/ig, "");
    return html;
  }

  function getAllCombinations(keywords) {
    var i, j, result = [];

    for (i = 0; i < keywords.length; i++) {
        for (j = i + 1; j < keywords.length + 1; j++) {
            result.push(keywords.slice(i, j).join(" "));
        }
    }
    return result;
  }

  $.ajax({
    url: path,
    dataType: "xml",
    success: function(xmlResponse) {
      // get the contents from search data
      var datas = $("entry", xmlResponse).map(function() {
        return {
          title: $("title", this).text(),
          content: $("content", this).text(),
          url: $("link", this).attr("href")
        };
      }).get();

      var $input = document.getElementById(searchId);
      if (!$input) { return; }
      var $resultContent = document.getElementById(contentId);

      // 初始化时显示热门关键词和历史记录
      function showSuggestions() {
        var suggestions = '<div class="search-suggestions">';

        // 搜索历史
        var history = searchHistory.get();
        if (history.length > 0) {
          suggestions += '<div class="search-history"><div class="suggestion-title"><i class="fa-solid fa-clock-rotate-left"></i> 最近搜索</div>';
          history.forEach(function(keyword) {
            suggestions += '<a href="#" class="suggestion-item" data-keyword="' + keyword + '">' + keyword + '</a>';
          });
          suggestions += '<button class="clear-history-btn" onclick="searchHistory.clear(); showSuggestions();"><i class="fa-solid fa-trash"></i> 清除</button></div>';
        }

        // 热门关键词
        suggestions += '<div class="popular-keywords"><div class="suggestion-title"><i class="fa-solid fa-fire"></i> 热门搜索</div>';
        popularKeywords.forEach(function(keyword) {
          suggestions += '<a href="#" class="suggestion-item" data-keyword="' + keyword + '">' + keyword + '</a>';
        });
        suggestions += '</div></div>';

        $resultContent.innerHTML = suggestions;

        // 绑定建议项点击事件
        $resultContent.querySelectorAll('.suggestion-item').forEach(function(item) {
          item.addEventListener('click', function(e) {
            e.preventDefault();
            $input.value = this.dataset.keyword;
            $input.dispatchEvent(new Event('input'));
          });
        });
      }

      // 初始化显示建议
      showSuggestions();

      // 监听输入事件
      var searchTimeout;
      $input.addEventListener("input", function(){
        clearTimeout(searchTimeout);
        var query = this.value.trim();

        if (query.length === 0) {
          showSuggestions();
          return;
        }

        // 延迟执行搜索，避免频繁请求
        searchTimeout = setTimeout(function() {
          var resultList = [];
          var keywords = getAllCombinations(query.toLowerCase().split(" "))
            .sort(function(a,b) { return b.split(" ").length - a.split(" ").length; });
          $resultContent.innerHTML = "";
          if (query.length <= 0) {
            return;
          }
        // perform local searching
        datas.forEach(function(data) {
          var matches = 0;
          if (!data.title || data.title.trim() === "") {
            data.title = "Untitled";
          }
          var dataTitle = data.title.trim().toLowerCase();
          var dataTitleLowerCase = dataTitle.toLowerCase();
          var dataContent = stripHtml(data.content.trim());
          var dataContentLowerCase = dataContent.toLowerCase();
          var dataUrl = data.url;
          var indexTitle = -1;
          var indexContent = -1;
          var firstOccur = -1;
          // only match artiles with not empty contents
          if (dataContent !== "") {
            keywords.forEach(function(keyword) {
              indexTitle = dataTitleLowerCase.indexOf(keyword);
              indexContent = dataContentLowerCase.indexOf(keyword);

              if( indexTitle >= 0 || indexContent >= 0 ){
                matches += 1;
                if (indexContent < 0) {
                  indexContent = 0;
                }
                if (firstOccur < 0) {
                  firstOccur = indexContent;
                }
              }
            });
          }
          // show search results
          if (matches > 0) {
            var searchResult = {};
            searchResult.rank = matches;
            searchResult.str = "<li><a href='"+ dataUrl +"' class='search-result-title'>"+ dataTitle +"</a>";
            if (firstOccur >= 0) {
              // cut out 100 characters
              var start = firstOccur - 20;
              var end = firstOccur + 80;

              if(start < 0){
                start = 0;
              }

              if(start == 0){
                end = 100;
              }

              if(end > dataContent.length){
                end = dataContent.length;
              }

              var matchContent = dataContent.substring(start, end);

              // highlight all keywords
              var regS = new RegExp(keywords.join("|"), "gi");
              matchContent = matchContent.replace(regS, function(keyword) {
                return "<em class=\"search-keyword\">"+keyword+"</em>";
              });

              searchResult.str += "<p class=\"search-result\">" + matchContent +"...</p>";
            }
            searchResult.str += "</li>";
            resultList.push(searchResult);
          }
        });
        if (resultList.length) {
          resultList.sort(function(a, b) {
              return b.rank - a.rank;
          });
          var result ="<ul class=\"search-result-list\">";
          for (var i = 0; i < resultList.length; i++) {
            result += resultList[i].str;
          }
          result += "</ul>";
          $resultContent.innerHTML = result;
        }, 300);
      });

      // 监听搜索完成事件，保存到历史记录
      $input.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && this.value.trim().length > 0) {
          searchHistory.add(this.value.trim());
        }
      });
    }
  });
};
