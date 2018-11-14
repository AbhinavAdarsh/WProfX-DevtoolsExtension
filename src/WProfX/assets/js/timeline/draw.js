class Draw{
  constructor(data, merged){
    this.data= data;
    this.merged = merged
    /*
    1- Find row number where there is a critical path element on it.
    2- We do not collapse anything on these rows.
    3- Between critical path rows we draw all objects of similar types in one row.
    --similar types (javascripttypelist && scripting || HTML and loading) || CSS and parseAuthorStylesheet || images || other

    */
    this.cpRows = [];
    this.segmentRows = {};
    this.rowMapHash = {};
    this.rowByActivity = {};
    this.mimeTypeCount = {};
    this.mimeTypeSize = {};

    // document.getElementById('txt1').style.display = "none";
    // document.getElementById('txtLogo').style.display = "none";
    // document.getElementById('imgLogo').style.display = "none";
    document.getElementById("viewJson").disabled = false;
    captureBtn.removeEventListener('click', (event) => _main(event));
    var dl = document.getElementById('download_json');
    if (dl != null){
      dl.removeEventListener('click', (event) => util.jsonLink(event));
      dl.outerHTML="";
    }
    this.d_legacy = {}
    this.dataHash = {}
    this.javascript_type_list = new Set(['application/x-javascript', 'application/javascript', 'application/ecmascript', 'text/javascript', 'text/ecmascript', 'application/json', 'javascript/text']),
    this.css_type_list = new Set(['text/css', 'css/text']),
    this.text_type_list = new Set(['evalhtml', 'text/html', 'text/plain', 'text/xml']),
    this.colorMap = new Object({
            "ctext": "#2757ae",
            "dtext": "#a8c5f7",
            "cjs": "#c9780e",
            "djs": "#e8ae61",
            "ccss": "#13bd0d",
            "dcss": "#8ae887",
            "cother": "#eb5bc0",
            "dother": "#eb5bc0",
            "dfont": "#c415be",
            "dimg": "#c79efa",
            "render": "#9b82e3",
            "paint": "#76b169"
        });
    this.deps = [];
    this.critPath = [];
    this.merged = merged;
    this.orig_data = null;
    this.loadEventEnd = 0;

  }

  dataArrives() {
      var items = [];
      var timeBegin = 10000;
      var timeEnd = 0;
      // console.log('this.data');
      //console.log(this.data);
      this.data = JSON.parse(JSON.stringify(this.data));
      //console.log("MMMMMMMMMMMM>>>>>>",this.data);

      var _this = this;
      this.data.forEach(function (elem, index)  {
          if (index === _this.data.length - 1) {
              _this.critPath = elem.criticalPath;
              _this.d_legacy['firstMeaningfulPaint'] = elem.firstMeaningfulPaint;
              _this.d_legacy['firstContentfulPaint'] = elem.firstContentfulPaint;
              _this.d_legacy['firstPaint'] = elem.firstPaint;
              _this.loadEventEnd = elem.loadEventEnd;
              _this.d_legacy['domContentLoadedEventEnd'] = elem.domContentLoadedEventEnd;
              _this.d_legacy['timeToInteractive'] = elem.timeToInteractive;
              // d_legacy["computationTime"] = elem.computationTime;
              // d_legacy["networkingTime"] = elem.networkingTime;
              return;
          }
          //Uncomment when netlog/sockets, DNS are added
          //if (index === data.length - 2) return;
          elem.objs.forEach(function (objElem, objindex) {
              if (elem.id === "Deps") {
                  objElem.id = "Deps_" + objElem.a1;
                  // Store the dependencies for line drawing
                  _this.deps.push(objElem);
              } else {
                  objElem.info = "";
                  objElem.event = "";
                  objElem.type = "";
                  objElem.descr = util.formatobjInfo(objElem);
                  // console.log(objElem.desc);
                  //objElem.descr = JSON.stringify(util.omitKeys(objElem, ['info','event']));
                  if (objElem.activityId.split('_')[0] == "Networking") {
                      objElem.event = "download";
                      var mimeType = objElem.mimeType;
                      if (_this.javascript_type_list.has(mimeType)) {
                          objElem.color = _this.colorMap["djs"];
                          objElem.type = 'js';
                          if('js' in _this.mimeTypeCount) {
                            _this.mimeTypeCount['js'] = _this.mimeTypeCount['js']+1;
                          }
                          else {
                            _this.mimeTypeCount['js'] = 1;
                          }
                          if('js' in _this.mimeTypeSize) {
                            _this.mimeTypeSize['js'] = _this.mimeTypeSize['js'] + objElem.transferSize;
                          }
                          else {
                            _this.mimeTypeSize['js'] = objElem.transferSize;
                          }

                          //objElem.descr = "JS Download";
                      } else if (_this.text_type_list.has(mimeType)) {
                          objElem.color = _this.colorMap["dtext"];
                          objElem.type = 'html';
                          if('html' in _this.mimeTypeCount) { 
                            _this.mimeTypeCount['html'] = _this.mimeTypeCount['html']+1;
                          }
                          else {
                            _this.mimeTypeCount['html'] = 1;
                          }
                          if('html' in _this.mimeTypeSize && objElem.transferSize != null) {
                            _this.mimeTypeSize['html'] = _this.mimeTypeSize['html'] + objElem.transferSize;
                            console.log("size = ",objElem.transferSize);
                          }
                          else {
                            _this.mimeTypeSize['html'] = objElem.transferSize;
                            console.log("size = ",objElem.transferSize);
                          }
                          //objElem.descr = "Text Download";
                      } else if (_this.css_type_list.has(mimeType)) {
                          objElem.color = _this.colorMap["dcss"];
                          objElem.type = 'css';
                          if('css' in _this.mimeTypeCount) {
                            _this.mimeTypeCount['css'] = _this.mimeTypeCount['css']+1;
                          }
                          else {
                            _this.mimeTypeCount['css'] = 1;
                          }
                          if('css' in _this.mimeTypeSize) {
                            _this.mimeTypeSize['css'] = _this.mimeTypeSize['css'] + objElem.transferSize;
                          }
                          else {
                            _this.mimeTypeSize['css'] = objElem.transferSize;
                          }                          
                          //objElem.descr = "CSS Download";
                      } else if (mimeType.indexOf('/') !== -1 && mimeType.split('/')[0] === "image") {
                          objElem.color = _this.colorMap["dimg"];
                          objElem.type = 'image';
                          if('image' in _this.mimeTypeCount) {
                            _this.mimeTypeCount['image'] = _this.mimeTypeCount['image']+1;
                          }
                          else {
                            _this.mimeTypeCount['image'] = 1;
                          }
                          if('image' in _this.mimeTypeSize) {
                            _this.mimeTypeSize['image'] = _this.mimeTypeSize['image'] + objElem.transferSize;
                          }
                          else {
                            _this.mimeTypeSize['image'] = objElem.transferSize;
                          }                          
                          //objElem.descr = "Image Download";
                      } else if (mimeType.indexOf('/') !== -1) {
                          var _substr = mimeType.split('/');
                          if (_substr.length > 1 && _substr[1].indexOf('font') !== -1 ){
                            objElem.color = _this.colorMap["dfont"];
                            objElem.type = 'font';
                            if('font' in _this.mimeTypeCount) _this.mimeTypeCount['font'] = _this.mimeTypeCount['font']+1;
                            else _this.mimeTypeCount['font'] = 1;
                            //objElem.descr = "Font Download";
                          }
                          else {
                              objElem.color = _this.colorMap["dother"];
                              objElem.type = 'other';
                              //objElem.descr = "Other Download";
                            }
                      } else {
                          objElem.color = _this.colorMap["dother"];
                          objElem.type = 'other';
                          //objElem.descr = "Other Download";
                      }
                  } else if (objElem.activityId.split('_')[0] == "Loading") {
                      objElem.event = "";
                      if (objElem.name === "ParseHTML" && objElem.url !== undefined && objElem.url !== "") {
                          objElem.color = _this.colorMap["ctext"];
                          objElem.info = "evaljs";
                          objElem.type = 'html';
                          //objElem.descr = "Parse HTML";
                      } else if (objElem.name === "ParseAuthorStyleSheet" && objElem.styleSheetUrl != undefined &&
                          objElem.styleSheetUrl !== "") {
                          objElem.color = _this.colorMap["ccss"];
                          objElem.info = "evalcss";
                          //objElem.descr = "Parse CSS";
                          objElem.url = objElem.styleSheetUrl;
                          objElem.type = 'css';
                      }
                  } else if (objElem.activityId.split('_')[0] == "Scripting") {
                      objElem.event = "script";
                      objElem.color = _this.colorMap["cjs"];
                      objElem.type = 'js';
                      //objElem.descr = "Scripting";
                  } else if (objElem.activityId.split('_')[0] == "Rendering") {
                      objElem.event = "render";
                      objElem.color = _this.colorMap["render"];
                      //objElem.descr = "Rendering";
                  } else if (objElem.activityId.split('_')[0] == "Painting") {
                      objElem.event = "paint";
                      objElem.color = _this.colorMap["paint"];
                      //objElem.descr = "Painting";
                  }

                  // Create the Object
                  objElem.id = objElem.activityId;
                  objElem.activityId = elem.id + "##" + objElem.id;
                  timeBegin = Math.min(parseFloat(timeBegin), parseFloat(objElem.startTime));
                  timeEnd = Math.max(parseFloat(timeEnd), parseFloat(objElem.endTime));

                  // Used for bar merging
                  objElem.row = index;
                    if (!(index in _this.segmentRows)){
                      _this.segmentRows[index] = [objElem.activityId, objElem.type] ;
                    }
                    else {
                      _this.segmentRows[index].push([objElem.activityId, objElem.type]);
                    }
                  // Filler
                  objElem.start = objElem.startTime;
                  objElem.end = objElem.endTime;
                  objElem.same_group = "";
		              objElem.same_with = "";
                  objElem.prev = []; // Previous elems. for dependencies.
                  objElem.next = []; // Previous elems. for dependencies.
                  objElem.offset = 0;
                  objElem.len = objElem.endTime - objElem.startTime;

                  // Row Number
                  objElem.download_group = index;
                  // console.log('objElem.download_group = index');
                  // console.log(objElem);
                  // console.log(index);
                  // Merge Group: used for bar collapse
                  objElem.mergedRow = index;
                  objElem.domain = tld.getDomain(elem.id);
                  items.push(objElem);
              }
          });
        });

         /*
          * Populate the dataHash- stores the index of the actual data
          * datahash[id] = i, items[i] = data_obj
          */
          for(var i=0; i<items.length; i++) {
              this.dataHash[items[i].id] = i;
          }
          // console.log('items');
          // console.log(items);
          // console.log('this.datahash');
          // console.log(this.dataHash);
         /*
          * Fill out the previous and next elements using dependencies
          * Can be done in timeline.js but we need it for bar collapse
          */
          _this = this;
          this.deps.forEach(function(elem, index) {
              var a1_id = elem.a1;
              var a2_id = elem.a2;
              items[_this.dataHash[a1_id]].next.push(items[_this.dataHash[a2_id]]);
              items[_this.dataHash[a2_id]].prev.push(items[_this.dataHash[a1_id]]);
          });

          this.d_legacy["critPath"] = this.critPath;
          this.d_legacy["data"] = items;
          this.d_legacy["loadTime"] = timeEnd - timeBegin;
          // console.log('this.d_legacy["loadTime"]');
          // console.log(this.d_legacy["loadTime"]);
          // // Using loadEventEnd from trace
          this.d_legacy["onLoad"] = this.loadEventEnd;
          // //d_legacy["htmlSource"] = filename.split(".json")[0];
          // console.log('deps');
          // console.log(this.deps);
          // console.log('critPath');
          // console.log(this.critPath);
          this.d_legacy["deps"] = this.deps;
          this.d_legacy["dataHash"] = this.dataHash;
          this.d_legacy['segmentRows'] = this.segmentRows;

          //drawGraph(compress);
          // Check if anything failed
          // .fail(function() {
          //     // Error shown
          //     alert("Invalid or Currupted JSON.");
          //     // Go back to previous page
          //     window.history.back();
          // });
  }



  drawGraph() {

      console.log("legacy>>>>>>>>>>",this.mimeTypeCount);
      var mime_data = [{
        key: "Mime Data",
        values: []
      }];
      for(var mime_type in this.mimeTypeCount){
        mime_data[0].values.push({
          "label": mime_type,
          "value": this.mimeTypeCount[mime_type]
        });
      }
      console.log("mime data >>>>>>>>>>", mime_data);
      console.log("legacy>>>>>>>>>>",this.data);
      //criticalPathPieData();


      var pieData = {};
      var _this = this;
      this.d_legacy.critPath.forEach(function(objElem, index){
        //console.log("objElem >>>>>", objElem);
        if(pieData[objElem.split("_")[0]] == null) pieData[objElem.split("_")[0]] = 0;
        var curr = _this.d_legacy.data.filter(d => d.id == objElem);
        //console.log("currrrrrrr >>>>>", curr);
        pieData[objElem.split("_")[0]] += (curr[0].endTime-curr[0].startTime);
      });

      var pieNew = [];
      var pie_New_3 = [];

      for(var key in pieData){
        var obj = {};
        obj['label'] = key;
        obj['value'] = pieData[key];
        pieNew.push(obj);
      }

      for(var key in this.mimeTypeSize){
        var obj = {};
        obj['label'] = key;
        obj['value'] = this.mimeTypeSize[key];
        pie_New_3.push(obj);
      }

      //console.log("legacy>>>>>>>>>>",pieNew);
      //var pieData_2 = {'networking', 'loading + scripting'};
      // var _this = this;
      // this.d_legacy.critPath.forEach(function(objElem, index){
      //   //console.log("objElem >>>>>", objElem);
      //   if(pieData_2[objElem.split("_")[0]] == null) pieData_2[objElem.split("_")[0]] = 0;
      //   var curr_2 = _this.d_legacy.data.filter(d => d.id == objElem);
      //   //console.log("currrrrrrr >>>>>", curr);
      //   pieData_2[objElem.split("_")[0]] += (curr_2[0].endTime-curr_2[0].startTime);
      // });

      //console.log("FOR BAR GRAPH >>>", this.d_legacy['segmentRows']);
      var pieNew_2 = [];
      pieNew_2.push({'label':'Networking', 
                      'value': this.data[this.data.length-1]['networkingTimeCp']
                    });
      pieNew_2.push({'label':'Loading',
                      'value': this.data[this.data.length-1]['loadingTimeCp']
                    });
      pieNew_2.push({'label':'Scripting', 
                      'value': this.data[this.data.length-1]['scriptingTimeCp']
                    });

      nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .showLabels(true)
            .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
            .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
            .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
            .donutRatio(0.45)     //Configure how big you want the donut hole size to be.
            .legendPosition("right")
            ;

        // Insert text into the center of the donut
        function centerText() {
          return function() {
            var svg = d3v3.select("#nvd3_svg_new");

            var donut = svg.selectAll("g.nv-slice").filter(
              function (d, i) {
                return i == 0;
              }
            );
           //Insert text inside donut
            //console.log(donut);
            donut.insert("text", "g")
            .text("On")
            .attr("class", "middle")
            .attr("text-anchor", "middle")
            .attr("dy", "-.55em")
            .style("fill", "#000");

            donut.insert("text", "g")
            .text("Critical Path")
            .attr("class", "middle")
            .attr("text-anchor", "middle")
            .attr("dy", ".85em")
            .style("fill", "#000");
      
          }
        }

        d3v3.select("#nvd3_svg_new")
            .datum(pieNew)
            .transition().duration(350)
            .call(chart)
            .call(centerText());

         //  g.append("text")
         // .attr("text-anchor", "middle")
         // .text("$" + totalValue);

          // Chart title   
          // d3v3.select("#nvd3_svg_new_2")
          //   .append("text")
          //   .attr("x", -350)             
          //   .attr("y", 350)
          //   .attr("text-anchor", "middle")  
          //   .text("Fig1. Networking vs Loading vs Scripting critical path Statistics");

        // function updateLegendPosition() {
        //   svg.selectAll(".nv-series")[0].forEach(function(d, i) {
        //     d3.select(d).attr("transform", "translate(0," + i * 15 + ")");
        //   })
        // }
        // svg.select('.nv-legend').on("click", function() {
        //   updateLegendPosition();
        // });

        // svg.select('.nv-legend').on("dblclick", function() {
        //   updateLegendPosition();
        // });

        // updateLegendPosition();

        return chart;
      });



      console.log(pieNew_2);
      nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .showLabels(true)
            .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
            .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
            .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
            .donutRatio(0.45)     //Configure how big you want the donut hole size to be.
            .legendPosition("right")
            ;

          // Insert text into the center of the donut
          function centerText() {
            return function() {
              var svg = d3v3.select("#nvd3_svg_new_2");
              var donut = svg.selectAll("g.nv-slice").filter(
                function (d, i) {
                  return i == 0;
                }
              );
          //Insert text inside donut
              console.log(donut);
              donut.insert("text", "g")
              .text("Total")
              .attr("class", "middle")
              .attr("text-anchor", "middle")
              //.attr("dy", "-.55em")
              .style("fill", "#000");
            }
          }

          d3v3.select("#nvd3_svg_new_2")
            .datum(pieNew_2)
            .transition().duration(350)
            .call(chart)
            .call(centerText())
            ;

          // Chart title   
          // d3v3.select("#nvd3_svg_new_2")
          //   .append("text")
          //   .attr("x", 350)             
          //   .attr("y", 350)
          //   .attr("text-anchor", "middle")  
          //   .text("Fig2. Networking vs Loading+Scripting Statistics");

        return chart;
      });

      //************************************************************************************
      // Third pie chart for size based on mime types
      console.log("3rd Pie chart data", pie_New_3);
      nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .showLabels(true)
            .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
            .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
            .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
            .donutRatio(0.45)     //Configure how big you want the donut hole size to be.
            .legendPosition("right")
            ;

          // Insert text into the center of the donut
          function centerText() {
            return function() {
              var svg = d3v3.select("#nvd3_svg_new_4");
              var donut = svg.selectAll("g.nv-slice").filter(
                function (d, i) {
                  return i == 0;
                }
              );
          //Insert text inside donut
            donut.insert("text", "g")
            .text("Bytes")
            .attr("class", "middle")
            .attr("text-anchor", "middle")
            .attr("dy", "-.55em")
            .style("fill", "#000");

            donut.insert("text", "g")
            .text("Transferred")
            .attr("class", "middle")
            .attr("text-anchor", "middle")
            .attr("dy", ".85em")
            .style("fill", "#000");
            }
          }

          d3v3.select("#nvd3_svg_new_4")
            .datum(pie_New_3)
            .transition().duration(350)
            .call(chart)
            .call(centerText())
            ;

        return chart;
      });

      //Changed below 
      /************************************************************************************/
      // Create bar graph
      // nv.addGraph(function() {
      // var chart = nv.models.multiBarChart()
      //   //.transitionDuration(350)
      //   .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
      //   .rotateLabels(0)      //Angle to rotate x-axis labels.
      //   .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
      //   .groupSpacing(0.1)    //Distance between each group of bars.
      // ;

      // chart.xAxis
      //     .tickFormat(d3v3.format(',f'));

      // chart.yAxis
      //     .tickFormat(d3v3.format(',.1f'));

      // d3v3.select('#nvd3_svg_new_3')
      //     .datum(mime_data)
      //     //.datum(bar_data) //Need to use all the features
      //     .call(chart);

      // nv.utils.windowResize(chart.update);

      //   return chart;
      // });

      // function exampleData() {
      //   return stream_layers(3,10+Math.random()*100,.1).map(function(data, i) {
      //     return {
      //       key: 'Stream #' + i,
      //       values: data
      //     };
      //   });
      // }
      nv.addGraph(function() {
        var chart = nv.models.discreteBarChart()
            .x(function(d) { return d.label })    //Specify the data accessors.
            .y(function(d) { return d.value })
            .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
            .tooltips(false)        //Don't show tooltips
            .showValues(true);       //...instead, show the bar value right on top of each bar.
            // .transitionDuration(350)

        d3v3.select('#nvd3_svg_new_3')
            .datum(mime_data)
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });



      /************************************************************************************/
      // Changed above


      var g = new svg(this.d_legacy, 'mySVG');
      g.draw(this.merged);
      //d3.select("#mySVG").transition() // Hori.
      //     .duration(800)
      //     .on('dblclick', g.mergeToggleHandler);
      var _mySVG = document.getElementById("mySVG");
      _mySVG.addEventListener('dblclick', (event) => g.mergeToggleHandler(event));


      var networkTab = document.getElementById("networkingChartTab");//.onclick = function() {changeClasses()};
      console.log(networkTab);
      networkTab.addEventListener('click', (event) => changeClasses());
      function changeClasses() {
          document.getElementById("networkingChartDIV").style.visibility = "visible";
          document.getElementById("summaryChartDIV").style.visibility = "hidden";
      }

      var summaryTab = document.getElementById("summaryChartTab");//.onclick = function() {changeClassesSummary()};
      console.log(summaryTab);
      summaryTab.addEventListener('click', (event) => changeClassesSummary());

      function changeClassesSummary() {
          document.getElementById("networkingChartDIV").style.visibility = "hidden";
          document.getElementById("summaryChartDIV").style.visibility = "visible";
      }

  }
}
