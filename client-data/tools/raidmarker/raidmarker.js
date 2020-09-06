/**
 *                        WHITEBOPHIR
 *********************************************************
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2013  Ophir LOJKINE
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend
 */

(function () { //Code isolation
	var board = Tools.board;

	var input = document.createElement("input");
	input.id = "textToolInput";
	input.type = "text";
	input.setAttribute("autocomplete", "off");

	var curText = {
		"x": 0,
		"y": 0,
		"size": 36,
		"rawSize": 16,
		"oldSize": 0,
		"opacity": 1,
		"color": "#000",
		"id": 0,
		"marker" : 0,
		"lastSending": 0
	};

	var active = false;


	function onStart() {
		curText.oldSize = Tools.getSize();
		Tools.setSize(curText.rawSize);
	}

	function onQuit() {
		stopEdit();
		Tools.setSize(curText.oldSize);
	}

	function clickHandler(x, y, evt, isTouchEvent) {
		//if(document.querySelector("#menu").offsetWidth>Tools.menu_width+3) return;
		if (evt.target === input) return;
		if (evt.target.tagName === "text") {
			editOldText(evt.target);
			evt.preventDefault();
			return;
		}
		curText.rawSize = Tools.getSize();
		curText.size = parseInt(curText.rawSize * 1.5 + 12);
		curText.opacity = Tools.getOpacity();
		curText.color = Tools.getColor();
		curText.x = x;
		curText.y = y + curText.size / 2;

		if (performance.now() - curText.lastSending > 100) {
			
			//If the user clicked where there was no text, then create a new text field
			if (curText.id === 0) {
				curText.id = Tools.generateUID("ra"); //"t" for text
				Tools.drawAndSend({
					'type': 'new',
					'id': curText.id,
					'color': curText.color,
					'size': curText.size,
					'opacity': curText.opacity,
					'x': curText.x,
					'y': curText.y
				})
			}
			Tools.drawAndSend({
				'type': "update",
				'id': curText.id,
				'txt': input.value.slice(0, 280)
			});
			//curText.sentText = input.value;
			curText.lastSending = performance.now();
	} 
		evt.preventDefault();
	}

	function createMarker(lineData) {
		//Creates a new line on the canvas, or update a line that already exists with new information
		var line = svg.getElementById(lineData.id) || Tools.createSVGElement("path");
		line.id = lineData.id;
		//If some data is not provided, choose default value. The line may be updated later
		line.setAttribute("stroke", lineData.color || "black");
		line.setAttribute("stroke-width", lineData.size || 10);
		line.setAttribute("opacity", Math.max(0.1, Math.min(1, lineData.opacity)) || 1);
		Tools.drawingArea.appendChild(line);
		return line;
	}


	function draw(data, isLocal) {
		Tools.drawingEvent = true;
		switch (data.type) {
			case "new":
				createMarker(data);
				break;
			case "update":
				var textField = document.getElementById(data.id);
				if (textField === null) {
					console.error("Text: Hmmm... I received text that belongs to an unknown text field");
					return false;
				}
				updateText(textField, data.txt);
				break;
			default:
				console.error("Text: Draw instruction with unknown type. ", data);
				break;
		}
	}

	Tools.add({ //The new tool
		"name": "RaidMarker",
		"shortcut": "m",
		"listeners": {
			"press": clickHandler,
		},
		"onstart": onStart,
		"onquit": onQuit,
		"draw": draw,
		"stylesheet": "tools/raidmarker/raidmarker.css",
		"icon": "tools/raidmarker/icon.png",
		"mouseCursor": "text"
	});

})(); //End of code isolation
