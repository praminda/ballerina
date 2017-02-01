/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
define(['require', 'lodash', 'jquery', 'jsPlumb', 'dagre'], function (require, _, $, jsPlumb, dagre) {

    var TypeMapper = function (onConnectionCallback, onDisconnectCallback, typeConverterView) {

        this.references = [];
        this.placeHolderName = "data-mapper-container-" + typeConverterView._model.id;
        this.idNameSeperator = "-";
        this.onConnection = onConnectionCallback;
        this.typeConverterView = typeConverterView;

        var strokeColor = "#414e66";
        var strokeWidth = 1;
        var pointColor = "#414e66";
        var pointSize = 0.5;

        jsPlumb.Defaults.Container = $("#" + this.placeHolderName);
        jsPlumb.Defaults.PaintStyle = {
            strokeStyle: strokeColor,
            lineWidth: strokeWidth
        };

        jsPlumb.Defaults.EndpointStyle = {
            radius: pointSize,
            fillStyle: pointColor
        };
        jsPlumb.Defaults.Overlays = [
            ["Arrow", {location: 1, width: 10, length: 10}]
        ];

        jsPlumb.importDefaults({
            Connector: ["Flowchart",
                {
                    cornerRadius: 20,
                    stub: 1, alwaysRespectStubs: false, midpoint: 0.2
                }]
        });

        var positionFunc = this.dagrePosition;
        var separator = this.idNameSeperator;
        var refObjects = this.references;

        jsPlumb.bind('dblclick', function (connection, e) {
            var sourceParts = connection.sourceId.split(separator);
            var targetParts = connection.targetId.split(separator);
            var sourceId = sourceParts.slice(0, 6).join('-');
            var targetId = targetParts.slice(0, 6).join('-');

            var sourceRefObj;
            var targetRefObj;

            for (var i = 0; i < refObjects.length; i++) {
                if (refObjects[i].name == sourceId) {
                    sourceRefObj = refObjects[i].refObj;
                } else if (refObjects[i].name == targetId) {
                    targetRefObj = refObjects[i].refObj;
                }
            }

            var PropertyConnection = {
                sourceStruct: sourceParts[0],
                sourceProperty: sourceParts[6],
                sourceType: sourceParts[7],
                sourceReference: sourceRefObj,
                targetStruct: targetParts[0],
                targetProperty: targetParts[6],
                targetType: targetParts[7],
                targetReference: targetRefObj
            };

            jsPlumb.detach(connection);
            positionFunc();
            onDisconnectCallback(PropertyConnection);
        });

        jsPlumb.bind('connection', function (info, ev) {
            positionFunc();
        });
    };

    TypeMapper.prototype.constructor = TypeMapper;

    TypeMapper.prototype.removeStruct = function (name) {
        var structId = name + '-' + this.typeConverterView._model.id;
        var structConns = $('div[id^="' + structId + '"]');
        for (var i = 0; i < structConns.length; i++) {
            var div = structConns[i];
            if (_.includes(div.className, 'property')) {
                jsPlumb.remove(div.id);
            }
        }
        $("#" + structId).remove();
        this.dagrePosition();
    };

    TypeMapper.prototype.addConnection = function (connection) {
        jsPlumb.connect({
            source: connection.sourceStruct + this.idNameSeperator + connection.sourceProperty + this.idNameSeperator + connection.sourceType,
            target: connection.targetStruct + this.idNameSeperator + connection.targetProperty + this.idNameSeperator + connection.targetType
        });
        this.dagrePosition();
    };


    TypeMapper.prototype.getConnections = function () {
        var connections = [];
        for (var i = 0; i < jsPlumb.getConnections().length; i++) {
            var sourceParts = jsPlumb.getConnections()[i].sourceId.split(this.idNameSeperator);
            var targetParts = jsPlumb.getConnections()[i].targetId.split(this.idNameSeperator);
            var connection = {
                sourceStruct: sourceParts[0],
                sourceProperty: sourceParts[6],
                sourceType: sourceParts[7],
                targetStruct: targetParts[0],
                targetProperty: targetParts[6],
                targetType: targetParts[7]
            };
            connections.push(connection);
        }
        return connections;
    };

    TypeMapper.prototype.addSourceStruct = function (struct, reference) {
        struct.id = struct.name + '-' + this.typeConverterView._model.id;
        this.makeStruct(struct, 50, 50, reference);
        for (var i = 0; i < struct.properties.length; i++) {
            this.addSourceProperty($('#' + struct.id), struct.properties[i].name, struct.properties[i].type);
        }
        this.dagrePosition();

    };

    TypeMapper.prototype.addTargetStruct = function (struct, reference) {
        struct.id = struct.name + '-' + this.typeConverterView._model.id;
        var placeHolderWidth = document.getElementById(this.placeHolderName).offsetWidth;
        var posY = placeHolderWidth - (placeHolderWidth / 4);
        this.makeStruct(struct, 50, posY, reference);
        for (var i = 0; i < struct.properties.length; i++) {
            this.addTargetProperty($('#' + struct.id), struct.properties[i].name, struct.properties[i].type);
        }
        this.dagrePosition();
    };

    TypeMapper.prototype.makeStruct = function (struct, posX, posY, reference) {
        this.references.push({name: struct.id, refObj: reference});
        var newStruct = $('<div>').attr('id', struct.id).addClass('struct');

        var structName = $('<div>').addClass('struct-name').text(struct.name);
        newStruct.append(structName);

        newStruct.css({
            'top': posX,
            'left': posY
        });

        $("#" + this.placeHolderName).append(newStruct);
        // jsPlumb.draggable(newStruct, {
        //     containment: 'parent'
        // });
    };

    TypeMapper.prototype.addFunction = function (func, reference) {
        this.references.push({name: func.name, refObj: reference});
        var newFunc = $('<div>').attr('id', func.name).addClass('func');

        var funcName = $('<div>').addClass('struct-name').text(func.name);
        newFunc.append(funcName);

        newFunc.css({
            'top': 0,
            'left': 0
        });

        $("#" + this.placeHolderName).append(newFunc);

        for (var i = 0; i < func.parameters.length; i++) {
            this.addTargetProperty($('#' + func.name), func.parameters[i].name, func.parameters[i].type);
        }

        this.addSourceProperty($('#' + func.name), "output", func.returnType);
        this.dagrePosition();

    };


    TypeMapper.prototype.makeProperty = function (parentId, name, type) {
        var id = parentId.selector.replace("#", "") + this.idNameSeperator + name + this.idNameSeperator + type;
        var property = $('<div>').attr('id', id).addClass('property');
        var propertyName = $('<span>').addClass('property-name').text(name);
        var seperator = $('<span>').addClass('property-name').text(":");
        var propertyType = $('<span>').addClass('property-type').text(type);

        property.append(propertyName);
        property.append(seperator);
        property.append(propertyType);
        $(parentId).append(property);
        return property;
    };

    TypeMapper.prototype.addSourceProperty = function (parentId, name, type) {
        jsPlumb.makeSource(this.makeProperty(parentId, name, type), {
            anchor: ["Continuous", {faces: ["right"]}]
        });
    };

    TypeMapper.prototype.addTargetProperty = function (parentId, name, type) {
        var callback = this.onConnection;
        var refObjects = this.references;
        var seperator = this.idNameSeperator;
        var typeConverterObj = this.typeConverterView;

        jsPlumb.makeTarget(this.makeProperty(parentId, name, type), {
            maxConnections: 1,
            anchor: ["Continuous", {faces: ["left"]}],
            beforeDrop: function (params) {
                //Checks property types are equal
                var sourceParts = params.sourceId.split(seperator);
                var targetParts = params.targetId.split(seperator);
                var isValidTypes = sourceParts[7] == targetParts[7];
                var sourceId = sourceParts.slice(0, 6).join('-');
                var targetId = targetParts.slice(0, 6).join('-');

                var sourceRefObj;
                var targetRefObj;

                for (var i = 0; i < refObjects.length; i++) {
                    if (refObjects[i].name == sourceId) {
                        sourceRefObj = refObjects[i].refObj;
                    } else if (refObjects[i].name == targetId) {
                        targetRefObj = refObjects[i].refObj;
                    }
                }

                var connection = {
                    sourceStruct: sourceParts[0],
                    sourceProperty: sourceParts[6],
                    sourceType: sourceParts [7],
                    sourceReference: sourceRefObj,
                    targetStruct: targetParts[0],
                    targetProperty: targetParts [6],
                    targetType: targetParts[7],
                    targetReference: targetRefObj
                };

                if (isValidTypes) {
                    callback(connection, typeConverterObj);
                }
                // } else {
                //     var compatibleTypeConverters = [];
                //     var typeConverters = typeConverterObj._package.getTypeConverterDefinitions();
                //     for (var i = 0; i < typeConverters.length; i++) {
                //         var aTypeConverter = typeConverters[i];
                //         if (typeConverterObj._model._typeConverterName !== aTypeConverter.getTypeConverterName()) {
                //             if (connection.sourceType == aTypeConverter.getSourceAndIdentifier().split(" ")[0] &&
                //                 connection.targetType == aTypeConverter.getReturnType()) {
                //                 compatibleTypeConverters.push(aTypeConverter.getTypeConverterName());
                //                 // console.log(aTypeConverter.getTypeConverterName());
                //                 // console.log(aTypeConverter.getSourceAndIdentifier());
                //                 // console.log(aTypeConverter.getReturnType());
                //             }
                //         }
                //     }
                //     console.log(compatibleTypeConverters);
                //     isValidTypes = compatibleTypeConverters.length > 0;
                // }
                return isValidTypes;
            },

            onDrop: function (params) {
                this.dagrePosition();
            }
        });
    };


    TypeMapper.prototype.dagrePosition = function () {
        // construct dagre graph from JsPlumb graph
        var g = new dagre.graphlib.Graph();
        var seperator = '-';

        var alignment = 'LR';

        if (jsPlumb.getAllConnections() == 0) {
            alignment = 'TD';
        }

        g.setGraph({ranksep: '50', rankdir: alignment, edgesep: '50', marginx: '0'});
        g.setDefaultEdgeLabel(function () {
            return {};
        });

        var nodes = $(".struct, .func");
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            g.setNode(n.id, {width: $("#" + n.id).width() + 30, height: $("#" + n.id).height() + 30});
        }
        var edges = jsPlumb.getAllConnections();
        for (var i = 0; i < edges.length; i++) {
            var c = edges[i];
            var sourceParts = c.source.id.split(seperator);
            var targetParts = c.target.id.split(seperator);
            var sourceId = sourceParts.slice(0, 6).join(seperator);
            var targetId = targetParts.slice(0, 6).join(seperator);
            g.setEdge(sourceId, targetId);
        }

        // calculate the layout (i.e. node positions)
        dagre.layout(g);
        // Applying the calculated layout
        g.nodes().forEach(function (v) {
            $("#" + v).css("left", g.node(v).x + "px");
            $("#" + v).css("top", g.node(v).y + "px");
        });
        jsPlumb.repaintEverything();
    };

    return TypeMapper;
});


