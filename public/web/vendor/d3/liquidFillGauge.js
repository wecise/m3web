/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 */
(function(d3) {
    var idGenerator = (function() {
        var count = 0;
        return function(prefix) {
            return prefix + "-" + count++;
        };
    })();

    var defaultConfig = {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#178BCA", // The color of the outer circle.
        backgroundColor: null, // The color of the background
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#178BCA", // The color of the fill wave.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        textVertPosition: 0.5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        displayPercent: true, // If true, a % symbol is displayed after the value.
        textColor: "#045681", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
    };

    d3.liquidfillgauge = function(g, value, settings) {
        // Handle configuration
        var config = d3.map(defaultConfig);
        d3.map(settings).forEach(function(key, val) {
            config.set(key, val);
        });

        g.each(function(d) {
            var gauge = d3.select(this);
            var radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height"))) / 2;
            var locationX = parseInt(gauge.style("width")) / 2 - radius;
            var locationY = parseInt(gauge.style("height")) / 2 - radius;
            var fillPercent = Math.max(config.get("minValue"), Math.min(config.get("maxValue"), value)) / config.get("maxValue");

            var waveHeightScale;
            if (config.get("waveHeightScaling")) {
                waveHeightScale = d3.scale.linear()
                    .range([0, config.get("waveHeight"), 0])
                    .domain([0, 50, 100]);
            } else {
                waveHeightScale = d3.scale.linear()
                    .range([config.get("waveHeight"), config.get("waveHeight")])
                    .domain([0, 100]);
            }

            var textPixels = (config.get("textSize") * radius / 2);
            var textFinalValue = parseFloat(value).toFixed(2);
            var textStartValue = config.get("valueCountUp") ? config.get("minValue") : textFinalValue;
            var percentText = config.get("displayPercent") ? "%" : "";
            var circleThickness = config.get("circleThickness") * radius;
            var circleFillGap = config.get("circleFillGap") * radius;
            var fillCircleMargin = circleThickness + circleFillGap;
            var fillCircleRadius = radius - fillCircleMargin;
            var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

            var waveLength = fillCircleRadius * 2 / config.get("waveCount");
            var waveClipCount = 1 + config.get("waveCount");
            var waveClipWidth = waveLength * waveClipCount;

            // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
            var textRounder = function(value) {
                return Math.round(value);
            };
            if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
                textRounder = function(value) {
                    return parseFloat(value).toFixed(1);
                };
            }
            if (parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))) {
                textRounder = function(value) {
                    return parseFloat(value).toFixed(2);
                };
            }

            // Data for building the clip wave area.
            var data = [];
            for (var i = 0; i <= 40 * waveClipCount; i++) {
                data.push({
                    x: i / (40 * waveClipCount),
                    y: (i / (40))
                });
            }

            // Scales for drawing the outer circle.
            var gaugeCircleX = d3.scale.linear().range([0, 2 * Math.PI]).domain([0, 1]);
            var gaugeCircleY = d3.scale.linear().range([0, radius]).domain([0, radius]);

            // Scales for controlling the size of the clipping path.
            var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
            var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0, 1]);

            // Scales for controlling the position of the clipping path.
            var waveRiseScale = d3.scale.linear()
                // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                // such that the it will won't overlap the fill circle at all when at 0%, and will totally cover the fill
                // circle at 100%.
                .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
                .domain([0, 1]);
            var waveAnimateScale = d3.scale.linear()
                .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
                .domain([0, 1]);

            // Scale for controlling the position of the text within the gauge.
            var textRiseScaleY = d3.scale.linear()
                .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
                .domain([0, 1]);

            // Center the gauge within the parent SVG.
            var gaugeGroup = gauge.append("g")
                .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

            // Draw the background circle
            if (config.get("backgroundColor")) {
                gaugeGroup.append("circle")
                    .attr("r", radius)
                    .style("fill", config.get("backgroundColor"))
                    .attr('transform', 'translate(' + radius + ',' + radius + ')');
            }

            // Draw the outer circle.
            var gaugeCircleArc = d3.svg.arc()
                .startAngle(gaugeCircleX(0))
                .endAngle(gaugeCircleX(1))
                .outerRadius(gaugeCircleY(radius))
                .innerRadius(gaugeCircleY(radius - circleThickness));
            gaugeGroup.append("path")
                .attr("d", gaugeCircleArc)
                .style("fill", config.get("circleColor"))
                .attr('transform', 'translate(' + radius + ',' + radius + ')');

            // Text where the wave does not overlap.
            var text1 = gaugeGroup.append("text")
                .attr("class", "liquidFillGaugeText")
                .attr("text-anchor", "middle")
                .attr("font-size", textPixels + "px")
                .style("fill", config.get("textColor"))
                .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.get("textVertPosition")) + ')');

            // The clipping wave area.
            var clipArea = d3.svg.area()
                .x(function(d) {
                    return waveScaleX(d.x);
                })
                .y0(function(d) {
                    return waveScaleY(Math.sin(Math.PI * 2 * config.get("waveOffset") * -1 + Math.PI * 2 * (1 - config.get("waveCount")) + d.y * 2 * Math.PI));
                })
                .y1(function(d) {
                    return (fillCircleRadius * 2 + waveHeight);
                });
            var clipId = idGenerator("clipWave");
            var waveGroup = gaugeGroup.append("defs")
                .append("clipPath")
                .attr("id", clipId);
            var wave = waveGroup.append("path")
                .datum(data)
                .attr("d", clipArea);

            // The inner circle with the clipping wave attached.
            var fillCircleGroup = gaugeGroup.append("g")
                .attr("clip-path", "url(#" + clipId + ")");
            fillCircleGroup.append("circle")
                .attr("cx", radius)
                .attr("cy", radius)
                .attr("r", fillCircleRadius)
                .style("fill", config.get("waveColor"));

            // Text where the wave does overlap.
            var text2 = fillCircleGroup.append("text")
                .attr("class", "liquidFillGaugeText")
                .attr("text-anchor", "middle")
                .attr("font-size", textPixels + "px")
                .style("fill", config.get("waveTextColor"))
                .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.get("textVertPosition")) + ')');

            // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
            var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;

            if (config.get("waveAnimate")) {
                var animateWave = function() {
                    wave.transition()
                        .duration(config.get("waveAnimateTime"))
                        .ease("linear")
                        .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
                        .each("end", function() {
                            wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
                            animateWave();
                        });
                };
                animateWave();
            }

            var transition = function(from, to) {
              // Update texts and animate
              if (config.get("valueCountUp")) {
                  var textTween = function() {
                      var i = d3.interpolate(from, to);
                      return function(t) {
                          this.textContent = textRounder(i(t)) + percentText;
                      }
                  };
                  text1.transition()
                      .duration(config.get("waveRiseTime"))
                      .tween("text", textTween);
                  text2.transition()
                      .duration(config.get("waveRiseTime"))
                      .tween("text", textTween);
              } else {
                    text1.text(textRounder(from) + percentText);
                    text2.text(textRounder(from) + percentText);
              }

              // Update the wave
              toPercent = Math.max(config.get("minValue"), Math.min(config.get("maxValue"), to)) / config.get("maxValue");
              fromPercent = Math.max(config.get("minValue"), Math.min(config.get("maxValue"), from)) / config.get("maxValue");

              if (config.get("waveRise")) {
                  waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fromPercent) + ')')
                      .transition()
                      .duration(config.get("waveRiseTime"))
                      .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(toPercent) + ')');
              } else {
                  waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(toPercent) + ')');
              }
            };

            transition(textStartValue, textFinalValue);

            // Event to update the value
            gauge.on("valueChanged", function(newValue) {
              transition(value, newValue);
              value = newValue;
            });
        });
    };
})(d3);