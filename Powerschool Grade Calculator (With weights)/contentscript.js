if(document.head.innerHTML.indexOf('<meta name="application-name" content="PowerSchool">') != -1){
  if (document.title == "PSSUMMER: Class Score Detail" || document.title == "Class Score Detail" ) {
      var tables = document.getElementsByTagName('table');
      var hm = new HashMap();
      if (tables.length == 2) {

          var courseTable = tables[0];
          var course = courseTable.rows[1].children[0].innerHTML;

          var assignTable = tables[1];
          var rows = assignTable.rows;
          for (var x = 0; x != rows.length; x++) {
              var currentRow = rows[x];
              var children = currentRow.children;
              if (x != 0) {
                  var category = children[1].innerHTML.replace(/<[^>]*>/g, "");
                  var score = children[8];
                  score = score.children[0].innerHTML.replace(/<[^>]*>/g, "");
                  score = score.replace(/,/g, "");
                  var str = score.split("/");
                  if(str.length == 2){
                    var str0 = str[0].replace(/,/g, "");
                    var str1 = str[1].replace(/,/g, "");
                    if (isNumeric(str0) == true && isNumeric(str1) == true) {
                        if (hm.containsKey(category)) {
                            var currentFraction = hm.get(category);
                            currentFraction.addToNumerator(parseFloat(str0));
                            currentFraction.addToDenominator(parseFloat(str1));
                        } else {
                            var frac = new Fraction(parseFloat(str0), parseFloat(str1));
                            hm.put(category, frac);
                        }
                    }
                  }else if(str.length == 1){
                    if(isNumeric(score)){//Extra credit
                      if (hm.containsKey(category)) {
                          var currentFraction = hm.get(category);
                          currentFraction.addToNumerator(parseFloat(score));
                          currentFraction.addToDenominator(0);
                      } else {
                          var frac = new Fraction(parseFloat(score), 0);
                          hm.put(category, frac);
                      }
                    }
                  }
              }
          }
          var scoreCode = "";

          var categoryList = new Array();
          var entrySet = hm.getEntrySet();
          var totalNum = 0;
          var totalDenom = 0;

          for (var i = 0; i != entrySet.length; i++) {
              var currentEntry = entrySet[i];
              var categoryName = currentEntry.getKey();
              if (categoryList.indexOf(categoryName) == -1) {
                  categoryList.push(categoryName);
              }
              var categoryScore = currentEntry.getValue();
              totalNum += categoryScore.getNumerator();
              totalDenom += categoryScore.getDenominator();
              var fractionScore = categoryScore.getNumerator() + "/" + categoryScore.getDenominator();
              var percentScore = Math.round(parseFloat(categoryScore.getNumerator()) / parseFloat(categoryScore.getDenominator()) * 100) + "%";
              scoreCode = scoreCode + "<br><b>" + categoryName + "</b> - " + fractionScore + " or " + percentScore + "";
          }
        //  document.getElementsByClassName("linkDescList")[0].getElementsByTagName("TD")[3].innerHTML = parseFloat((totalNum/totalDenom)*100).toFixed(2) + "%";
          var addonCode = '<div id="pscc"><h3>PowerSchool Category Calculation Scores</h3><p class="center"><b>Category Calculations for ' + course + '</b>' + scoreCode + '</p></div>';
          var calculator = '<button type="button" id="toggleCalculationsArea" style="display: block; margin-left: auto;margin-right: auto;">Show Category Calculations</button>';
          addonCode = addonCode + '<br>' + calculator + '<br>';
          var categorySelect = '<select class="pcc-select">' + getCompleteCategoryCode(categoryList) + '</select>';
          addonCode = addonCode + '<div style="display: none;" id="categoryCalculationsDiv">';
          addonCode = addonCode + '<br><hr><br>';
          addonCode = addonCode + '<p><b>Grading Method: <span id="scaleSystem">Weights</span></b><button style="display: inline-block;margin-left: 4px;" id="toggleScaleSystem" type="button">Use point system</button>';
          addonCode = addonCode + '<div class="box-round" id="gradeScalingArea">' + getCompleteInputCode(categoryList) + '</div>';
          var assignmentCode = '<br><table border="0" cellpadding="0" cellspacing="0" align="center" width="99%"><tbody id="pccTBody"><tr class="center"><th>Category</th><th>Score (Ex: 5/5)</th><th>Options</th></tr></tbody></table><br><div style="width: (100% - 40px);margin-left: auto;margin-right: auto;"><button style="margin-left: auto;margin-right: auto;display: block;" type="button" id="pccAdd">Add assignment</button></div>';
          assignmentCode = assignmentCode + '<br><br><button style="display:block;font-size: 18px;margin-left: auto;margin-right: auto;" type="button" id="calculatePSCC">Calculate Future Score</button></div>';
          addonCode = addonCode + assignmentCode;
          addonCode = addonCode + '<br><div id="futureScoreArea"></div>';
          document.getElementById("legend").innerHTML = addonCode + document.getElementById("legend").innerHTML;
          
          document.getElementById("pccAdd").onclick = function() {
            addAssignmentRow(categorySelect);
          };
          
          document.body.onclick = function(e) {
              if (window.event) {
                  e = event.srcElement;
              } else {
                  e = e.target;
              }

              if(e.className){
                if (e.className.indexOf('pcc-remove') != -1) {
                  e.parentNode.parentNode.parentNode.removeChild(e.parentNode.parentNode);
                }else if(e.className.indexOf('pcc-duplicate') != -1){
                  dupAssignmentRow(e);
                }
              }
          };
          
          window.usingPointSystem = false;       
          document.getElementById('toggleScaleSystem').onclick = function() {
              if (window.usingPointSystem == false) {
                  document.getElementById('scaleSystem').innerHTML = 'Points';
                  document.getElementById('toggleScaleSystem').innerHTML = 'Use weight system';
                  document.getElementById('gradeScalingArea').style.display = 'none';
              } else {
                  document.getElementById('scaleSystem').innerHTML = 'Weights';
                  document.getElementById('toggleScaleSystem').innerHTML = 'Use point system';
                  document.getElementById('gradeScalingArea').style.display = 'block';
                  document.getElementById('gradeScalingArea').innerHTML = getCompleteInputCode(categoryList);
              }
              window.usingPointSystem = !window.usingPointSystem;
          };
          document.getElementById('toggleCalculationsArea').onclick = function() {
              var categoryCalculationsDiv = document.getElementById('categoryCalculationsDiv');
              var futureScoreArea = document.getElementById('futureScoreArea');

              if (categoryCalculationsDiv.style.display == 'none') {
                  categoryCalculationsDiv.style.display = 'block';
                  document.getElementById('toggleCalculationsArea').innerHTML = 'Hide Category Calculations';
                  futureScoreArea.style.display = 'block';
              } else if (categoryCalculationsDiv.style.display == 'block') {
                  document.getElementById('toggleCalculationsArea').innerHTML = 'Show Category Calculations';
                  categoryCalculationsDiv.style.display = 'none';
                  futureScoreArea.style.display = 'none';
              } else {
                  document.getElementById('toggleCalculationsArea').innerHTML = 'Hide Category Calculations';
                  categoryCalculationsDiv.style.display = 'block';
                  futureScoreArea.style.display = 'block';
              }
          };
          document.getElementById('calculatePSCC').onclick = function() {
            var dupCurrentCategories = clone(hm);
            
            var scoreArea = document.getElementById('futureScoreArea');
            scoreArea.innerHTML = '';
            
            var newAssignmentList = [];
            
            var newAssignmentRows = childrenObjectToArrayForRows(document.getElementById("pccTBody").children);
            
            for(var n = 0; n != newAssignmentRows.length;n++){
              var currentAssignmentRow = newAssignmentRows[n];
              var assignCategory = currentAssignmentRow.getElementsByClassName("pcc-select")[0].options[currentAssignmentRow.getElementsByClassName("pcc-select")[0].selectedIndex].value;
              var assignScore = currentAssignmentRow.getElementsByClassName("pcc-score")[0].value;
              var splt = assignScore.split('/');
              var numerator = 0;
              var denominator = 0;
              if(splt.length == 2){
                var splt0 = splt[0].replace(/,/g , "");
                var splt1 = splt[1].replace(/,/g , "");
                if(isNumeric(splt0) && isNumeric(splt1)){
                  numerator = parseFloat(splt0);
                  denominator = parseFloat(splt1);
                }else{
                  continue;
                }
              }else if(splt.length == 1){
                var splt0 = splt[0].replace(/,/g , "");
                if(isNumeric(splt0)){
                  numerator = parseFloat(splt0);
                }else{
                  continue;
                }
              }else{
                continue;
              }
              var score = new Fraction(numerator, denominator);
              var assignment = new Assignment(assignCategory, score);
              newAssignmentList.push(assignment);
            }
            
            for(var n = 0; n != newAssignmentList.length;n++){
              var currentAssignment = newAssignmentList[n];
              var currentCategoryFraction = dupCurrentCategories.get(currentAssignment.getCategory());
              currentCategoryFraction.setNumerator(currentCategoryFraction.getNumerator()+currentAssignment.getScore().getNumerator());
              currentCategoryFraction.setDenominator(currentCategoryFraction.getDenominator()+currentAssignment.getScore().getDenominator());
              dupCurrentCategories.put(currentAssignment.getCategory(), currentCategoryFraction);
            }

            var weightArray = [];
            if(!window.usingPointSystem){
              var inputs = document.getElementById('gradeScalingArea').getElementsByTagName('input');
              for (var i = 0; i != inputs.length; i++) {
                  var thisInput = inputs[i];
                  if (typeof thisInput.getAttribute("category-type") != 'undefined') {
                      weightArray[i] = inputs[i].value;
                  }
              }
            }
            
            var scoreCode = '';            
            var totalWeightPercent = 0;
            var totalAssignNumerator = 0;
            var totalAssignDenominator = 0;
            
            var categories = dupCurrentCategories.getEntrySet();
            for(var n = 0; n != categories.length;n++){
              var category = categories[n];
              var categoryName = category.getKey();
              var categoryScore = category.getValue();
              totalAssignNumerator += categoryScore.getNumerator();
              totalAssignDenominator += categoryScore.getDenominator();
              var percentScore = Math.round(parseFloat(categoryScore.getNumerator()) / parseFloat(categoryScore.getDenominator()) * 100) + "%";
              scoreCode += '<center><b>' + categoryName + '</b> - ' + categoryScore.getNumerator() + '/' + categoryScore.getDenominator() + ' or ' + percentScore + '';
              if(!window.usingPointSystem){
                 var catWeight = weightArray[n];
                 var decimalCatScore = categoryScore.getNumerator()/categoryScore.getDenominator();
                 var percentOfGrade = decimalCatScore*catWeight;
                 totalWeightPercent += percentOfGrade;
                 scoreCode += ' - <b>weighted ' + percentOfGrade + ' percent of grade</b>';
              }
              scoreCode += '</center>';
             }
             
             var overallPercent;
             if(window.usingPointSystem){
               overallPercent = (totalAssignNumerator/totalAssignDenominator)*100;
             }else{
               overallPercent = totalWeightPercent;
             }
             scoreCode += '<br><center>Overall: ' + overallPercent + '%</center>';
             scoreArea.innerHTML = scoreCode;
          };
      }
  }else if(document.title == 'Grades and Attendance'){
    addHonorsChecks();
    var qLookup = document.getElementById('quickLookup');
    var tbody = qLookup.getElementsByTagName("tbody")[1];
    tbody.innerHTML = '<tr><td align="center" id="pscc"></td></tr>';
    updateGPA();
  }
}

function childrenObjectToArrayForRows(obj){
  var a = [];
  for(var n = 1; n != obj.length;n++){
    a.push(obj[n]);
  }
  return a;
}

function dupAssignmentRow(dom){
  var tr = document.createElement('tr');
  tr.className = "center";
  tr.innerHTML = dom.parentNode.parentNode.innerHTML;
  document.getElementById("pccTBody").appendChild(tr);
  document.getElementsByClassName("pcc-select")[document.getElementsByClassName("pcc-select").length-1].selectedIndex = dom.parentNode.parentNode.getElementsByClassName("pcc-select")[0].selectedIndex;
  document.getElementsByClassName("pcc-score")[document.getElementsByClassName("pcc-score").length-1].value = dom.parentNode.parentNode.getElementsByClassName("pcc-score")[0].value;
}
function addAssignmentRow(categorySelect){
  var tr = document.createElement('tr');
  tr.className = "center";
  tr.innerHTML = '<tr class="center"><td>' + categorySelect + '</td><td><input type="text" class="pcc-score" style="padding: 4px;"></td><td><button style="display:inline-block;" type="button" class="pcc-duplicate">&</button><button style="display:inline-block;" type="button" class="pcc-remove">-</button></td></tr>';
  document.getElementById("pccTBody").appendChild(tr);
}

function getCompleteCategoryCode(categoryList) {
    var code = "";
    for (var i = 0; i != categoryList.length; i++) {
        var currentCategory = categoryList[i];
        code = code + '<option value="' + currentCategory + '">' + currentCategory + '</option>';
    }
    return code;
}

function getCompleteInputCode(categoryList) {
    var code = "";
    for (var i = 0; i != categoryList.length; i++) {
        var currentCategory = categoryList[i];
        code = code + getInputCode(currentCategory + "-in", currentCategory);
    }
    return code;
}

function getInputCode(id, cName) {
    return '<div class="input-group" style="margin-left: 12px;margin-top: 6px;margin-bottom:6px;padding: 4px;display: inline-block;"><span class="input-group-addon" id="' + id + '">' + cName + '% </span><input type="number" category-type="' + cName + '"style="padding: 4px;" min="1" max="100" value="0" aria-describedby="basic-addon1"></div>';
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function HashMap() {
    this.entries = [];

    this.getEntrySet = function() {
        return this.entries;
    }
    
    this.setEntrySet = function(newEntries) {
      this.entries = newEntries;
    }

    this.containsKey = function(key) {
        var exist = false;
        for (i = 0; i < this.entries.length; i++) {
            var currentEntry = this.entries[i];
            if (currentEntry.getKey() == key) {
                exist = true;
                break;
            }
        }
        return exist;
    }

    this.get = function(key) {
        var returning = -1;
        for (i = 0; i < this.entries.length; i++) {
            var currentEntry = this.entries[i];
            if (currentEntry.getKey() == key) {
                returning = currentEntry.getValue();
                break;
            }
        }
        return returning;
    }

    this.put = function(key, value) {
        for (i = 0; i < this.entries.length; i++) {
            var currentEntry = this.entries[i];
            if (currentEntry.getKey() == key) {
                this.entries.splice(i, 1);
                break;
            }
        }
        var newEntry = new Entry(key, value);
        this.entries.push(newEntry);
    }
}

function calculateGPA(){
  var qLookup = document.getElementById('quickLookup');
  var trs = qLookup.getElementsByTagName("tbody")[0].children;
  var pointArray = [];
  var pointArrayIncludeD = [];

  var currentGradeCheck = 0;
  
  for(var n = 0; n != trs.length;n++){
    var tr = trs[n];
    if(tr.id){
      if(tr.id.indexOf("ccid") != -1){
        var as = tr.getElementsByTagName("A");
        for(var i = 0; i != as.length;i++){
          var a = as[i];
          if(a.href){
            if(a.href.indexOf("fg=S1") != -1 || a.href.indexOf("fg=S2") != -1){
              if(a.innerHTML != '--'){
                var letterGrade = a.innerHTML.split("<br>")[0];
                console.log(letterGrade);
                var pointValue = getPointValue(letterGrade);
                if(letterGrade == 'D' | letterGrade == 'F'){
                  pointValue = 0;
                }else{
                  pointValue += document.getElementsByClassName("pscc-cb")[currentGradeCheck].checked;
                }
                pointArray.push(pointValue);
                if(letterGrade == 'D'){
                  pointArrayIncludeD.push(1+document.getElementsByClassName("pscc-cb")[currentGradeCheck].checked);
                }else{
                  pointArrayIncludeD.push(pointValue);
                }
                currentGradeCheck++;
              }
            }
          }
        }
      }
    }
  }

  var GPA = sumArray(pointArray)/pointArray.length;
  var withDGPA = sumArray(pointArrayIncludeD)/pointArrayIncludeD.length;
  return {gpa: GPA.toFixed(2), dgpa: withDGPA.toFixed(2)};
}

function updateGPA(){
  var obj = calculateGPA();
  document.getElementById("pscc").innerHTML = "Semester GPA: <b>" + obj.gpa + "</b> rounded<br>Semester GPA(With D=1): <b>" + obj.dgpa + "</b> rounded";
}

function addHonorsChecks(){
  var qLookup = document.getElementById('quickLookup');
  var as = qLookup.getElementsByTagName("A");
  for(var n = 0; n != as.length; n++){
    var a = as[n];
    if(typeof a.href != 'undefined'){
      if(a.href.indexOf("teacherinfo.html") != -1){
        var cbArea = document.createElement("div");
        a.parentNode.appendChild(cbArea);
        
        cbArea.innerHTML += '<span>Honors/AP</span><input type="checkbox" class="pscc-cb">';
      }
    }
  }
  var checkboxes = document.getElementsByClassName("pscc-cb");
  for(var n = 0 ; n != checkboxes.length;n++){
    var cb = checkboxes[n];
    cb.onclick = function(e){
      console.log("Updated a box");
      updateGPA();
    };
  }
}

function sumArray(arr){
  var a = 0;
  for(var n = 0; n != arr.length;n++){
    a += arr[n];
  }
  return a;
}

function getPointValue(letterGrade){
  var grades = ['F','D','C','B','A'];
  return grades.indexOf(letterGrade);
}

function clone(item) {/*nemisj*/
    if (!item) { return item; }
    var types = [ Number, String, Boolean ], 
        result;
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });
    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) { 
                result[index] = clone( child );
            });
        } else if (typeof item == "object") {
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );    
            } else if (!item.prototype) {
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    result = {};
                    for (var i in item) {
                        result[i] = clone( item[i] );
                    }
                }
            } else {
                if (false && item.constructor) {
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}

function Entry(key, value) {
    this.key = key;
    this.value = value;
    this.getKey = function() {
        return this.key;
    }

    this.getValue = function() {
        return this.value;
    }
}

function Assignment(category, score){
  this.category = category;
  this.score = score;
  
  this.getCategory = function() {
    return this.category;
  }
  
  this.getScore = function() {
    return this.score;
  }
}
function Fraction(numerator, denominator) {
    this.numerator = numerator;
    this.denominator = denominator;

    this.getNumerator = function() {
        return this.numerator;
    }

    this.getDenominator = function() {
        return this.denominator;
    }

    this.setNumerator = function(num) {
        this.numerator = num;
    }

    this.setDenominator = function(denom) {
        this.denominator = denom;
    }

    this.addToNumerator = function(a) {
        this.numerator = this.numerator + a;
    }

    this.addToDenominator = function(a) {
        this.denominator = this.denominator + a;
    }
}