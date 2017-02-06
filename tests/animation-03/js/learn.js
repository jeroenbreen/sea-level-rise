/*! Microsoft Flight Simulator | http://microsoft.com/ %> */
!function () {
    window.FlightArcade = window.FlightArcade || {};
    var a = {
        controls: {},
        utils: {},
        views: {},
        data: {},
        babylon: {},
        game: {},
        planes: {},
        missions: {},
        exports: window.FlightArcade,
        events: new Backbone.Model
    };
    !function () {
        a.social = {};
        var b = function (a) {
            var b = 550, c = 300, d = screen.width / 2 - b / 2, e = screen.height / 3 - c / 2, f = "http://www.facebook.com/sharer.php?s=100&p[title]=" + encodeURIComponent(a.title) + "&p[summary]=" + encodeURIComponent(a.message) + "&p[url]=" + encodeURIComponent(a.url);
            window.open(f, "facebook", "height=" + c + ",width=" + b + ",left=" + d + ",top=" + e + ",resizable=1")
        }, c = function (a) {
            var b = 550, c = 300, d = screen.width / 2 - b / 2, e = screen.height / 3 - c / 2, f = "http://twitter.com/share?url=/&text=" + encodeURIComponent(a.message) + "&count=none";
            window.open(f, "tweet", "height=" + c + ",width=" + b + ",left=" + d + ",top=" + e + ",resizable=1")
        };
        $(document).ready(function () {
            var d = {
                title: "Flight Arcade",
                url: "http://flightarcade.com",
                message: "Earn your wings playing Flight Arcade from Microsoft, a showcase for the modern web platform."
            };
            $("#socialFacebook").click(function () {
                b({
                    title: d.title,
                    url: d.url
                }), a.analytics && a.analytics.socialShare && a.analytics.socialShare("facebook")
            }), $("#socialTwitter").click(function () {
                c({
                    title: d.title,
                    url: d.url,
                    message: d.message + " " + d.url
                }), a.analytics && a.analytics.socialShare && a.analytics.socialShare("facebook")
            })
        })
    }(), function () {
        function b(b) {
            this.container = b.container, this.canvas = b.canvas, this.engine = new BABYLON.Engine(this.canvas, !0), this.scene = new BABYLON.Scene(this.engine), this.maxWidth = b.maxWidth, this.paused = null, this.events = new Backbone.Model, this.updateFps = _.throttle(_.bind(function () {
                this.fps = this.engine.getFps().toFixed()
            }, this), 500), this.windowHandlers = {
                resize: $.proxy(this.resize, this),
                unload: $.proxy(this.unload, this)
            }, this.deltaMA = new a.utils.MovingAverage(200, 1e3 / 60), this.onAnimationFrame = _.bind(function () {
                var a = Math.min(this.engine.deltaTime, 50), b = this.deltaMA.addSample(a);
                this.update(b), this.render()
            }, this), $(window).on(this.windowHandlers)
        }

        b.prototype.start = function () {
            this.paused !== !1 && (this.engine.runRenderLoop(this.onAnimationFrame), this.paused = !1, this.events.trigger("pauseChanged", this.paused))
        }, b.prototype.stop = function () {
            this.paused || this.engine.stopRenderLoop(), this.paused = !0, this.events.trigger("pauseChanged", this.paused)
        }, b.prototype.togglePause = function () {
            return this.paused !== !1 ? this.start() : this.stop(), this.paused
        }, b.prototype.showDebugLayer = function () {
            this.scene.debugLayer.show()
        }, b.prototype.resize = function () {
            if (this.maxWidth) {
                var a = Math.min(this.maxWidth / this.container.clientWidth, 1);
                this.engine.setHardwareScalingLevel(a), console.log("scaling level: " + a)
            }
            this.engine.resize()
        }, b.prototype.update = function (a) {
            this.updateFps()
        }, b.prototype.render = function () {
            this.scene.render()
        }, b.prototype.unload = function () {
            this.events.off();
            var b = this.canvas;
            if (b) {
                var c = b.getContext("webgl") || b.getContext("experimental-webgl");
                c && a.babylon.resetWebGLContext(c)
            }
            $(window).off(this.windowHandlers)
        }, a.babylon.BasicWorld = b
    }(), function () {
        function b(a, b, c) {
            this.name = a, this.id = a, this.options = c, this.blendScaleU = c.blendScaleU || 1, this.blendScaleV = c.blendScaleV || 1, this._scene = b, b.materials.push(this);
            var d = c.assetManager, e = d.addTextureTask("blend-material-base-task", c.baseImage);
            e.onSuccess = _.bind(function (a) {
                this.baseTexture = a.texture, this.baseTexture.uScale = 1, this.baseTexture.vScale = 1, c.baseHasAlpha && (this.baseTexture.hasAlpha = !0)
            }, this), e = d.addTextureTask("blend-material-blend-task", c.blendImage), e.onSuccess = _.bind(function (a) {
                this.blendTexture = a.texture, this.blendTexture.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE, this.blendTexture.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE
            }, this)
        }

        window.BABYLON && (b.prototype = Object.create(BABYLON.Material.prototype), b.prototype.needAlphaBlending = function () {
            return this.options.baseHasAlpha === !0
        }, b.prototype.needAlphaTesting = function () {
            return !1
        }, b.prototype.isReady = function (a) {
            var b = this._scene.getEngine();
            return this.baseTexture && this.blendTexture ? (this._effect || (this._effect = b.createEffect("blend", ["position", "normal", "uv"], ["worldViewProjection", "world", "blendScaleU", "blendScaleV", "vFogInfos", "vFogColor"], ["baseSampler", "blendSampler"], "")), this._effect.isReady() ? !0 : !1) : !1
        }, b.prototype.bind = function (a, b) {
            var c = this._scene;
            this._effect.setFloat4("vFogInfos", c.fogMode, c.fogStart, c.fogEnd, c.fogDensity), this._effect.setColor3("vFogColor", c.fogColor), this._effect.setMatrix("world", a), this._effect.setMatrix("worldViewProjection", a.multiply(c.getTransformMatrix())), this._effect.setTexture("baseSampler", this.baseTexture), this._effect.setTexture("blendSampler", this.blendTexture), this._effect.setFloat("blendScaleU", this.blendScaleU), this._effect.setFloat("blendScaleV", this.blendScaleV)
        }, b.prototype.dispose = function () {
            this.baseTexture && this.baseTexture.dispose(), this.blendTexture && this.blendTexture.dispose(), this.baseDispose()
        }, a.babylon.BlendMaterial = b)
    }(), function () {
        function b(a, b) {
            this.world = a, this.remaining = 1e3 * b, this.elapsed = 0, this.paused = !0, this.onExpiration = null, a.events.on("pauseChanged", this.onPauseChanged, this)
        }

        function c(a) {
            return 10 > a ? "0" + a : a
        }

        b.prototype.onPauseChanged = function (a) {
            a ? this.stop() : this.start()
        }, b.prototype.start = function () {
            this.paused = !1
        }, b.prototype.stop = function () {
            this.paused = !0
        }, b.prototype.extendTime = function (a) {
            this.remaining += 1e3 * a
        }, b.toClockString = function (a) {
            var b = a / 1e3, d = Math.floor(b / 60), e = Math.floor(b % 60);
            return d + ":" + c(e)
        }, b.prototype.elapsedString = function () {
            return b.toClockString(this.elapsed)
        }, b.prototype.remainingString = function () {
            return b.toClockString(this.remaining)
        }, b.prototype.update = function () {
            if (!this.paused && 0 !== this.remaining) {
                var a = Math.min(100, this.world.engine.deltaTime, this.remaining);
                this.elapsed += a, this.remaining -= a, 0 === this.remaining && this.onExpiration && this.onExpiration()
            }
        }, a.babylon.CountdownClock = b
    }(), a.babylon.mergeMeshes = function (a, b, c) {
        for (var d = [], e = [], f = [], g = [], h = [], i = [], j = [], k = [], l = [], m = [], n = new BABYLON.Mesh(a, c), o = !0, p = !0, q = !0, r = !0, s = !0, t = 0; t !== b.length; t++)b[t].isVerticesDataPresent([BABYLON.VertexBuffer.UVKind]) || (o = !1), b[t].isVerticesDataPresent([BABYLON.VertexBuffer.UV2Kind]) || (p = !1), b[t].isVerticesDataPresent([BABYLON.VertexBuffer.ColorKind]) || (q = !1), b[t].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesIndicesKind]) || (r = !1), b[t].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesWeightsKind]) || (s = !1);
        for (t = 0; t !== b.length; t++) {
            var u, v, w, x = 0, y = 0;
            d[t] = b[t].getVerticesData(BABYLON.VertexBuffer.PositionKind), e[t] = b[t].getVerticesData(BABYLON.VertexBuffer.NormalKind), o && (f = f.concat(b[t].getVerticesData(BABYLON.VertexBuffer.UVKind))), p && (g = g.concat(b[t].getVerticesData(BABYLON.VertexBuffer.UV2Kind))), q && (h = h.concat(b[t].getVerticesData(BABYLON.VertexBuffer.ColorKind))), r && (i = i.concat(b[t].getVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind))), s && (j = j.concat(b[t].getVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind)));
            var z = l.length / 3;
            b[t].computeWorldMatrix(!0);
            var A = b[t].getWorldMatrix();
            for (x = 0; x !== d[t].length; x += 3)u = new BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(d[t][x], d[t][x + 1], d[t][x + 2]), A), l.push(u.x), l.push(u.y), l.push(u.z);
            for (y = 0; y !== e[t].length; y += 3)u = new BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(e[t][y], e[t][y + 1], e[t][y + 2]), A), m.push(u.x), m.push(u.y), m.push(u.z);
            for (v = b[t].getIndices(), w = 0; w !== v.length; w++)k.push(v[w] + z);
            k = k.concat(v), b[t].dispose(!1)
        }
        return n.setVerticesData(BABYLON.VertexBuffer.PositionKind, l, !1), n.setVerticesData(BABYLON.VertexBuffer.NormalKind, m, !1), f.length > 0 && n.setVerticesData(BABYLON.VertexBuffer.UVKind, f, !1), g.length > 0 && n.setVerticesData(BABYLON.VertexBuffer.UV2Kind, f, !1), h.length > 0 && n.setVerticesData(BABYLON.VertexBuffer.ColorKind, f, !1), i.length > 0 && n.setVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind, f, !1), j.length > 0 && n.setVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind, f, !1), n.setIndices(k), n
    }, function () {
        function b() {
            this.grid = [], this.minX = 0, this.minZ = 0, this.maxX = 0, this.maxZ = 0, this.cellSize = 0
        }

        b.prototype.initFromJson = function (a) {
            this.grid = a.grid, this.minX = a.minX, this.minZ = a.minZ, this.maxX = a.maxX, this.maxZ = a.maxZ, this.cellSize = a.cellSize
        }, b.prototype.initFromMesh = function (a, b) {
            b = b || 100, a.refreshBoundingInfo();
            var c = a.getBoundingInfo(), d = c.boundingBox.minimumWorld, e = c.boundingBox.maximumWorld;
            this.minX = Math.floor(d.x), this.minZ = Math.floor(d.z), this.maxX = Math.ceil(e.x), this.maxZ = Math.ceil(e.z);
            var f = this.maxX - this.minX, g = this.maxZ - this.minZ, h = f * g;
            this.cellSize = Math.sqrt(h / b);
            var i, j, k, l, m, n = Math.ceil(f / this.cellSize), o = Math.ceil(g / this.cellSize);
            for (i = 0; n > i; i++)for (this.grid[i] = m = [], k = i * this.cellSize + this.minX, j = 0; o > j; j++)l = j * this.cellSize + this.minZ, m[j] = a.getHeightAtCoordinates(k, l)
        }, b.prototype.getHeight = function (a, b) {
            if (a < this.minX || a > this.maxX || b < this.minZ || b > this.maxZ) {
                return 0;
            }
            var c = Math.round((a - this.minX) / this.cellSize), d = this.grid[c];
            if (!d) {
                return 0;
            }
            var e = Math.round((b - this.minZ) / this.cellSize);
            return d[e] || 0
        }, "undefined" != typeof module && module.exports ? module.exports = b : a && a.babylon && (a.babylon.MeshHeightCache = b)
    }(), function () {
        function b(a, b, c) {
            a.position.x = b.x, a.position.y = b.y, a.position.z = b.z, c.randomX && (a.position.x += Math.random() * c.randomX), c.randomY && (a.position.y += Math.random() * c.randomY), c.randomZ && (a.position.z += Math.random() * c.randomZ), c.offsetX && (a.position.x += c.offsetX), c.offsetY && (a.position.y += c.offsetY), c.offsetZ && (a.position.z += c.offsetZ), c.rotationY && (a.rotation.y = c.rotationY), c.randomRotationY && (a.rotation.y += Math.random() * c.randomRotationY);
            var d = c.scale || 1;
            c.randomScale && (d += Math.random() * c.randomScale), a.scaling.x = d, a.scaling.y = d, a.scaling.z = d
        }

        a.babylon.MeshHelper = {}, a.babylon.MeshHelper.createAtPoints = function (c, d) {
            if (0 !== d.points.length) {
                var e = function (e) {
                    var f = _.map(d.points, function (a, c) {
                        var f = e.createInstance(d.key + "-" + c);
                        return b(f, a, d), f.computeWorldMatrix(!0), f
                    });
                    if (f.length > 1 && c.perf.mergeMeshes && f.length < c.perf.mergeMeshMax) {
                        var g = a.babylon.mergeMeshes(d.key + "-merged", f, c.scene);
                        g.material = e.material
                    }
                }, f = d.meshCache || c.meshCache || {}, g = f[d.key];
                if (g) {
                    return void e(g);
                }
                var h = c.assets.addMeshTask(d.key + "-task", "", d.path, d.babylonFile);
                h.onSuccess = function (a) {
                    var c = f[d.key] = a.loadedMeshes[0];
                    b(c, d.points.pop(), d), e(c)
                }
            }
        }, a.babylon.MeshHelper.createRectangle = function (a, b, c, d, e) {
            var f = new BABYLON.Mesh(a, d), g = [], h = [], i = [], j = [], k = b / 2, l = c / 2;
            return h.push(-k, -l, 0), i.push(0, 0, -1), j.push(0, 0), h.push(k, -l, 0), i.push(0, 0, -1), j.push(1, 0), h.push(k, l, 0), i.push(0, 0, -1), j.push(1, 1), h.push(-k, l, 0), i.push(0, 0, -1), j.push(0, 1), g.push(0), g.push(1), g.push(2), g.push(0), g.push(2), g.push(3), f.setVerticesData(h, BABYLON.VertexBuffer.PositionKind, e), f.setVerticesData(i, BABYLON.VertexBuffer.NormalKind, e), f.setVerticesData(j, BABYLON.VertexBuffer.UVKind, e), f.setIndices(g), f
        }
    }(), function () {
        function b(a, b) {
            if (this.size = a, this.values = [], this.insertIndex = 0, this.total = 0, this.average = 0, this.initialValue) {
                for (var c = 0; c < this.size; c++)this.addSample(b)
            }
        }

        b.prototype.addSample = function (a) {
            if (this.values.length < this.size) {
                this.values.push(a), this.total += a;
            } else {
                var b = this.values[this.insertIndex];
                this.values[this.insertIndex] = a, this.insertIndex = (this.insertIndex + 1) % this.size, this.total += a - b
            }
            return this.average = this.total / this.values.length, this.average
        }, a.utils.MovingAverage = b
    }(), function () {
        function b(a, b, c) {
            this.name = b, this.runAction = c, this.isCompleted = !1, this.isError = !1, a._tasks.push(this)
        }

        b.prototype.checkCompletion = function () {
            this._onFulfill && this._onReject && this.isCompleted && (this.isError ? this._onReject() : this._onFulfill(), this._onFulfill = this._onReject = null)
        }, b.prototype.run = function (a, b, c) {
            this._onFulfill = function () {
                this.onSuccess && this.onSuccess(this), b()
            }, this._onReject = function () {
                this.onError && this.onError(this), c()
            }, this.runAction && this.runAction(), this.checkCompletion()
        }, b.prototype.fulfill = function () {
            this.isCompleted = !0, this.checkCompletion()
        }, b.prototype.reject = function () {
            this.isCompleted = !0, this.isError = !0, this.checkCompletion()
        }, a.babylon.PromiseTask = b
    }(), function () {
        function b(a, b, c, d) {
            this.name = a, this.id = a, this.light = c, this._scene = b, b.materials.push(this), this.bumpTexture = new BABYLON.Texture(d.bumpImage, b), this.bumpTexture.uScale = 20, this.bumpTexture.vScale = 20, this.bumpTexture.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE, this.bumpTexture.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE, this.reflectionTexture = new BABYLON.MirrorTexture("reflection", 512, b, !0), this.refractionTexture = new BABYLON.RenderTargetTexture("refraction", 512, b, !0), this.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0), this.refractionTexture.onBeforeRender = function () {
                BABYLON.clipPlane = new BABYLON.Plane(0, 1, 0, 0)
            }, this.refractionTexture.onAfterRender = function () {
                BABYLON.clipPlane = null
            }, _.extend(this, {
                waterColor: new BABYLON.Color3(0, .3, .1),
                waterColorLevel: .2,
                fresnelLevel: 1,
                reflectionLevel: .6,
                refractionLevel: .8,
                waveLength: 1,
                waveHeight: 1.5,
                waterDirection: new BABYLON.Vector2(0, 1)
            }, d), this._time = 0
        }

        window.BABYLON && (b.prototype = Object.create(BABYLON.Material.prototype), b.prototype.needAlphaBlending = function () {
            return !0
        }, b.prototype.needAlphaTesting = function () {
            return !1
        }, b.prototype.getRenderTargetTextures = function () {
            var a = [];
            return a.push(this.reflectionTexture), a.push(this.refractionTexture), a
        }, b.prototype.isReady = function (a) {
            var b = this._scene.getEngine();
            return this.bumpTexture && !this.bumpTexture.isReady ? !1 : (this._effect = b.createEffect("water", ["position", "normal", "uv"], ["worldViewProjection", "world", "vLightPosition", "vEyePosition", "waterColor", "vLevels", "waveData", "windMatrix", "vFogInfos", "vFogColor"], ["reflectionSampler", "refractionSampler", "bumpSampler"], ""), this._effect.isReady() ? !0 : !1)
        }, b.prototype.bind = function (a, b) {
            this._time += 1e-4 * this._scene.getAnimationRatio(), this._effect.setMatrix("world", a), this._effect.setMatrix("worldViewProjection", a.multiply(this._scene.getTransformMatrix())), this._effect.setVector3("vEyePosition", this._scene.activeCamera.position), this._effect.setVector3("vLightPosition", this.light.position), this._effect.setColor3("waterColor", this.waterColor), this._effect.setFloat4("vLevels", this.waterColorLevel, this.fresnelLevel, this.reflectionLevel, this.refractionLevel), this._effect.setFloat2("waveData", this.waveLength, this.waveHeight);
            var c = this._scene;
            this._effect.setFloat4("vFogInfos", c.fogMode, c.fogStart, c.fogEnd, c.fogDensity), this._effect.setColor3("vFogColor", c.fogColor), this._effect.setMatrix("windMatrix", this.bumpTexture.getTextureMatrix().multiply(BABYLON.Matrix.Translation(this.waterDirection.x * this._time, this.waterDirection.y * this._time, 0))), this._effect.setTexture("bumpSampler", this.bumpTexture), this._effect.setTexture("reflectionSampler", this.reflectionTexture), this._effect.setTexture("refractionSampler", this.refractionTexture)
        }, b.prototype.dispose = function () {
            this.bumpTexture && this.bumpTexture.dispose(), this.groundTexture && this.groundTexture.dispose(), this.snowTexture && this.snowTexture.dispose(), this.baseDispose()
        }, a.babylon.WaterMaterial = b)
    }(), function () {
        window.BABYLON && !BABYLON.Color3.fromHex && (BABYLON.Color3.fromHex = function (a) {
            var b = parseInt(a, 16), c = b >> 16 & 255, d = b >> 8 & 255, e = 255 & b;
            return BABYLON.Color3.FromInts(c, d, e)
        })
    }(), function () {
        function b(a) {
            var b = a.getParameter(a.MAX_VERTEX_ATTRIBS), c = a.createBuffer();
            a.bindBuffer(a.ARRAY_BUFFER, c);
            for (var d = 0; b > d; ++d)a.disableVertexAttribArray(d), a.vertexAttribPointer(d, 4, a.FLOAT, !1, 0, 0), a.vertexAttrib1f && a.vertexAttrib1f(d, 0);
            a.deleteBuffer(c);
            for (var e = a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS), f = 0; e > f; ++f)a.activeTexture(a.TEXTURE0 + f), a.bindTexture(a.TEXTURE_CUBE_MAP, null), a.bindTexture(a.TEXTURE_2D, null);
            for (a.activeTexture(a.TEXTURE0), a.useProgram(null), a.bindBuffer(a.ARRAY_BUFFER, null), a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, null), a.bindFramebuffer(a.FRAMEBUFFER, null), a.bindRenderbuffer(a.RENDERBUFFER, null), a.disable(a.BLEND), a.disable(a.CULL_FACE), a.disable(a.DEPTH_TEST), a.disable(a.DITHER), a.disable(a.SCISSOR_TEST), a.blendColor(0, 0, 0, 0), a.blendEquation(a.FUNC_ADD), a.blendFunc(a.ONE, a.ZERO), a.clearColor(0, 0, 0, 0), a.clearDepth(1), a.clearStencil(-1), a.colorMask(!0, !0, !0, !0), a.cullFace(a.BACK), a.depthFunc(a.LESS), a.depthMask(!0), a.depthRange(0, 1), a.frontFace(a.CCW), a.hint(a.GENERATE_MIPMAP_HINT, a.DONT_CARE), a.lineWidth(1), a.pixelStorei(a.PACK_ALIGNMENT, 4), a.pixelStorei(a.UNPACK_ALIGNMENT, 4), a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL, !1), a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), a.UNPACK_COLORSPACE_CONVERSION_WEBGL && a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL, a.BROWSER_DEFAULT_WEBGL), a.polygonOffset(0, 0), a.sampleCoverage(1, !1), a.scissor(0, 0, a.canvas.width, a.canvas.height), a.stencilFunc(a.ALWAYS, 0, 4294967295), a.stencilMask(4294967295), a.stencilOp(a.KEEP, a.KEEP, a.KEEP), a.viewport(0, 0, a.canvas.width, a.canvas.height), a.clear(a.COLOR_BUFFER_BIT | a.DEPTH_BUFFER_BIT | a.STENCIL_BUFFER_BIT); a.getError(););
        }

        a.babylon.resetWebGLContext = b
    }(), function () {
        function b(a) {
            c.call(this, {canvas: document.getElementById("webglCanvas")}), this.subdivisions = a.subdivisions || 30, this.createCamera(), this.addLights(), this.imageCanvas = document.getElementById("canvas"), this.updateExistingGround = !0, this.material = new BABYLON.StandardMaterial("groundMaterial", this.scene), this.diffuseTexture = new BABYLON.Texture(a.textureUrl, this.scene), this.toggleWireframe(!0), window.world = this
        }

        var c = a.babylon.BasicWorld;
        b.prototype = Object.create(c.prototype), b.prototype.constructor = b, b.prototype.toggleWireframe = function (a) {
            this.material.wireframe = a, this.material.diffuseTexture = a ? null : this.diffuseTexture
        }, b.prototype.updateHeightMap = function () {
            (!this.ground || this.updateExistingGround) && (this.ground && this.ground.dispose(), this.ground = new BABYLON.GroundMesh("ground", this.scene), this.ground._subdivisions = this.subdivisions, this.ground._setReady(!1), this.ground.material = this.material);
            var a = this.imageCanvas.getContext("2d"), b = this.imageCanvas.width, c = this.imageCanvas.height;
            if (b && c) {
                var d = a.getImageData(0, 0, b, c).data, e = BABYLON.VertexData.CreateGroundFromHeightMap(100, Math.round(100 * c / b), this.ground._subdivisions, 0, 25, d, b, c);
                e.applyToMesh(this.ground, !0), this.ground._setReady(!0)
            }
        }, b.prototype.createCamera = function (a) {
            this.camera = new BABYLON.ArcRotateCamera("camera", -90 * Math.PI / 180, 60 * Math.PI / 180, 130, new BABYLON.Vector3(0, 0, 0), this.scene), this.camera.attachControl(this.canvas, !0)
        }, b.prototype.addLights = function () {
            this.sun = new BABYLON.PointLight("sun", new BABYLON.Vector3(100, 100, 10), this.scene), this.addAmbientLight(0, 100, 0)
        }, b.prototype.addAmbientLight = function (a, b, c) {
            var d = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(a, b, c), this.scene);
            d.diffuse = new BABYLON.Color3(1, 1, 1), d.specular = new BABYLON.Color3(1, 1, 1), d.groundColor = new BABYLON.Color3(0, 0, 0), d.intensity = .8
        }, a.game.MeshSampleWorld = b
    }(), function () {
        function b(a, b) {
            function c() {
                var a = .95 * i.sliderWidth - 24, b = (i.initialValue + i.inc / 2 - i.min) / o, c = a * b;
                c > i.inc / 2 && a > c ? b = c : c < i.inc / 2 ? b = 0 : c > a && (b = a), q.css({left: b}), u.width(b + 10)
            }

            function d(a) {
                l = t.offset().left, m = a - q.offset().left, n = t.width() - q.width(), s.addClass("showMe"), i.onStart(a)
            }

            function e(a) {
                j = a - l - m, j > 0 && n > j ? k = j : 0 > j ? k = 0 : j > n && (k = n), u.width(k + 10), q.css({left: k}), g.value = Math.floor((o * (k / n) + i.min) / i.inc) * i.inc, g.onMove(g.value)
            }

            function f(a) {
                s.removeClass("showMe"), a.off("mousemove touchmove"), i.onEnd(g.value)
            }

            var g = this, h = {
                sliderWidth: null,
                min: 0,
                max: 1e3,
                inc: 10,
                initialValue: 500,
                onStart: function (a) {
                    return null
                },
                onMove: function (a) {
                    return null
                },
                onEnd: function (a) {
                    return null
                }
            }, i = $.extend({}, h, b), j = 0, k = 0, l = 0, m = 0, n = 0, o = i.max - i.min, p = a, q = $('<div class="slider-control-ball-display" />'), r = $('<div class="slider-control-ball" />'), s = $('<div class="inner-shadow" />'), t = $('<div class="slider-bar" />'), u = $('<div class="slider-bar-active" />');
            t.append(u.append(q.append([s, r]))), p.append(t).addClass("slider-container"), this.settings = i, this.active = !1, this.container = p, this.value = 0, this.settings.sliderWidth = this.settings.sliderWidth ? this.settings.sliderWidth : p.innerWidth(), this.onMove = this.settings.onMove, this.wall = $('<div class="slider-control-wall" />').on("mouseup", function () {
                f($(this)), $(this).hide(), $(this).detach()
            }).on("mouseleave", function () {
                $(this).trigger("mouseup")
            }), this.ball = r.on("mousedown", function (a) {
                1 === a.which && (p.append(g.wall), g.wall.show(), d(a.clientX), g.wall.on("mousemove touchmove", function (a) {
                    e(a.clientX)
                }))
            }).on("touchstart", function (a) {
                d(a.audioSourceAltEvent.targetTouches[0].clientX), $(this).on("touchmove", function (a) {
                    e(a.audioSourceAltEvent.targetTouches[0].clientX), a.preventDefault()
                }), a.preventDefault()
            }).on("touchend", function () {
                f($(this))
            }), c()
        }

        a.controls.SliderControl = b
    }(), function () {
        function b() {
            d.update(), f.clearRect(0, 0, h.w, h.h), f.drawImage(g, 0, 0, h.w, h.h, 0, 0, h.w, h.h), $.each(i, function (a, b) {
                var c = !!d.buttons[a], e = b.inactive;
                (!c || b.opacity) && f.drawImage(g, e.x, e.y, b.w, b.h, b.x, b.y, b.w, b.h), c && (e = b.active, f.drawImage(g, e.x, e.y, b.w, b.h, b.x, b.y, b.w, b.h))
            }), $.each(j, function (a, b) {
                var c = !!d.buttons[a], e = c ? b.active : b.inactive, h = d[a];
                f.drawImage(g, e.x, e.y, b.w, b.h, b.x + h.x * b.travel, b.y + h.y * b.travel, b.w, b.h)
            }), window.requestAnimationFrame(b)
        }

        function c() {
            d = new PxGamepad, d.start(), e = document.getElementById("gamepadCanvas"), e.width = h.w, e.height = h.h, f = e.getContext("2d");
            var a = new PxLoader;
            g = a.addImage("images/learn/gamepadSprite.png"), a.addCompletionListener(function () {
                window.requestAnimationFrame(b)
            }), a.start()
        }

        var d = null, e = null, f = null, g = null, h = {
            w: 1040,
            h: 815
        }, i = {
            a: {
                x: 745,
                y: 242,
                w: 79,
                h: 79,
                inactive: {x: 1217, y: 643},
                active: {x: 1062, y: 643}
            },
            b: {
                x: 820,
                y: 175,
                w: 79,
                h: 79,
                inactive: {x: 1140, y: 800},
                active: {x: 1141, y: 725}
            },
            x: {
                x: 678,
                y: 176,
                w: 79,
                h: 79,
                inactive: {x: 1220, y: 725},
                active: {x: 1065, y: 801}
            },
            y: {
                x: 745,
                y: 105,
                w: 79,
                h: 79,
                inactive: {x: 1140, y: 645},
                active: {x: 1062, y: 721}
            },
            leftTop: {
                x: 144,
                y: 0,
                w: 245,
                h: 90,
                inactive: {x: 613, y: 818},
                active: {x: 1062, y: 94}
            },
            rightTop: {
                x: 645,
                y: 0,
                w: 245,
                h: 90,
                inactive: {x: 1056, y: 0},
                active: {x: 1056, y: 188}
            },
            select: {
                x: 414,
                y: 183,
                w: 54,
                h: 54,
                inactive: {x: 1241, y: 552},
                active: {x: 1244, y: 460}
            },
            start: {
                x: 569,
                y: 183,
                w: 54,
                h: 54,
                inactive: {x: 1245, y: 370},
                active: {x: 1247, y: 278}
            },
            dpadUp: {
                x: 352,
                y: 290,
                w: 70,
                h: 87,
                inactive: {x: 1074, y: 557},
                active: {x: 1166, y: 557},
                opacity: !0
            },
            dpadDown: {
                x: 351,
                y: 369,
                w: 70,
                h: 87,
                inactive: {x: 1074, y: 366},
                active: {x: 1165, y: 366},
                opacity: !0
            },
            dpadLeft: {
                x: 298,
                y: 342,
                w: 87,
                h: 70,
                inactive: {x: 1066, y: 475},
                active: {x: 1158, y: 475},
                opacity: !0
            },
            dpadRight: {
                x: 383,
                y: 342,
                w: 87,
                h: 70,
                inactive: {x: 1062, y: 292},
                active: {x: 1156, y: 292},
                opacity: !0
            }
        }, j = {
            leftStick: {
                x: 185,
                y: 134,
                w: 150,
                h: 150,
                travel: 20,
                inactive: {x: 464, y: 816},
                active: {x: 310, y: 813}
            },
            rightStick: {
                x: 581,
                y: 290,
                w: 150,
                h: 150,
                travel: 20,
                inactive: {x: 464, y: 816},
                active: {x: 310, y: 813}
            }
        };
        a.exports.learnGamepad = c
    }(), function () {
        var b = {
            aButton: {x: 1221, y: 647, width: 73, height: 72},
            aButtonOn: {x: 1065, y: 647, width: 73, height: 72},
            bButton: {x: 1142, y: 801, width: 72, height: 72},
            bButtonOn: {x: 1143, y: 724, width: 72, height: 72},
            backButton: {x: 1247, y: 556, width: 46, height: 46},
            backButtonOn: {x: 1249, y: 465, width: 46, height: 46},
            base: {x: 0, y: 0, width: 1060, height: 813},
            dPadDown: {x: 1065, y: 373, width: 86, height: 87},
            dPadDownOn: {x: 1156, y: 373, width: 86, height: 87},
            dPadLeft: {x: 1065, y: 465, width: 87, height: 86},
            dPadLeftOn: {x: 1157, y: 465, width: 87, height: 86},
            dPadRight: {x: 1065, y: 282, width: 87, height: 86},
            dPadRightOn: {x: 1157, y: 282, width: 87, height: 86},
            dPadUp: {x: 1065, y: 556, width: 86, height: 86},
            dPadUpOn: {x: 1156, y: 556, width: 86, height: 86},
            leftJoystick: {x: 154, y: 818, width: 149, height: 149},
            leftJoystickOn: {x: 308, y: 818, width: 149, height: 149},
            rightJoystick: {x: 462, y: 818, width: 149, height: 149},
            rightJoystickOn: {x: 0, y: 818, width: 149, height: 149},
            startButton: {x: 1247, y: 373, width: 47, height: 46},
            startButtonOn: {x: 1249, y: 282, width: 47, height: 46},
            topButtonLeft: {x: 616, y: 818, width: 235, height: 89},
            topButtonLeftOn: {x: 1065, y: 94, width: 235, height: 89},
            topButtonRight: {x: 1065, y: 0, width: 235, height: 89},
            topButtonRightOn: {x: 1065, y: 188, width: 235, height: 89},
            xButton: {x: 1220, y: 724, width: 72, height: 72},
            xButtonOn: {x: 1065, y: 801, width: 72, height: 72},
            yButton: {x: 1143, y: 647, width: 73, height: 72},
            yButtonOn: {x: 1065, y: 724, width: 73, height: 72}
        };
        a.data.gamepadSprite = b, a.data.gamepadSpriteImageSrc = decodeURIComponent("images/learn/gamepadSprite.png")
    }(), function () {
        function b(a, b) {
            var c, d, e, f, g, h = a.width / a.height, i = b.width / b.height;
            i > h ? (c = a.width, d = a.width / i, e = a.x + 0, f = a.y + (a.height - d) / 2, g = d / b.height) : (c = a.height * i, d = a.height, f = a.y + 0, e = a.x + (a.width - c) / 2, g = c / b.width);
            var j = {width: c, height: d, x: e, y: f, scale: g};
            return j
        }

        function c() {
            g = $("#learnModal"), h = $("#learnVideoHost"), i = $('<iframe src="//www.youtube.com/embed/' + j + '?autoplay=1&controls=1&color=white&modestbranding=1&showinfo=0&html5=1&enablejsapi=1" id="ief-modal-video"  width="960" height="720"  frameborder="0"  allowfullscreen=""></iframe>'), $("#learnVideo").on("click", e), $("#learnModalOverlay").on("click", f)
        }

        function d() {
            var a = {
                x: 40,
                y: 40,
                width: $(window).width() - 80,
                height: $(window).height() - 80
            }, c = {x: 0, y: 0, width: k, height: l}, d = b(a, c);
            h.css({left: d.x, top: d.y, width: d.width, height: d.height})
        }

        function e() {
            i && (d(), g.show(), g.addClass("learnVideoPrepare"), setTimeout(function () {
                g.addClass("learnVideoShow")
            }, 50), setTimeout(function () {
                h.append(i)
            }, 400))
        }

        function f() {
            h.empty(), g.removeClass("learnVideoShow"), setTimeout(function () {
                g.hide().removeClass("learnVideoPrepare")
            }, 600)
        }

        var g, h, i, j = "xyaq9TPmXrA", k = 960, l = 540;
        a.exports.learnLearn = c
    }(), function () {
        function b() {
            function b(a, b, c) {
                this.context = a, this.urlList = b, this.onload = c, this.bufferList = [], this.loadCount = 0
            }

            function c() {
                o.width = o.parentElement.offsetWidth, p.width = p.parentElement.offsetWidth, M = (o.width || p.width) + 200
            }

            function d(a, b) {
                function c() {
                    l = requestAnimationFrame(c), b.clearRect(0, 0, M, N), d.forEach(function (c, d) {
                        a[d].getByteTimeDomainData(c), b.lineWidth = 2, b.strokeStyle = 0 === d ? "#FEAB68" : "#808080", b.beginPath();
                        for (var f = 1, g = M * f / e, h = 0, i = N * (1 / 6) * (0 === d ? -1 : 1), j = 0; e > j; j += f) {
                            var k = c[j] / 256 * N + i;
                            0 === j ? b.moveTo(h, k) : b.lineTo(h, k), h += g
                        }
                        b.lineTo(M, N / 2), b.stroke()
                    })
                }

                var d = [], e = 512;
                M = (o.width || p.width) + 200, N = o.height || p.height, a ? (b.clearRect(0, 0, M, N), a.forEach(function (a) {
                        a.fftSize = e, d.push(new Uint8Array(e))
                    }), c()) : window.cancelAnimationFrame(c)
            }

            function e(a) {
                for (var b, c = "number" == typeof a ? a : 50, d = 44100, e = new Float32Array(d), f = Math.PI / 180, g = 0; d > g; ++g)b = 2 * g / d - 1, e[g] = (3 + c) * b * 20 * f / (Math.PI + c * Math.abs(b));
                return e
            }

            function f(a) {
                var b = j.createBufferSource(), c = j.createGain(), d = j.createConvolver(), e = j.createAnalyser(), f = j.createAnalyser(), g = j.createBiquadFilter(), h = j.createWaveShaper();
                return d.buffer = m[2], b.buffer = a, b.loop = !0, b.onended = function () {
                }, {
                    source: b,
                    gainNode: c,
                    convolver: d,
                    analyser: e,
                    analyserAlt: f,
                    biquadFilter: g,
                    waveShaper: h
                }
            }

            function g() {
                w = f(m[1]), w.waveShaper.curve = e(K), w.waveShaper.oversample = "4x", w.source.connect(w.analyser), O ? (w.gainNode.value = L, w.analyser.connect(w.convolver), w.convolver.connect(w.waveShaper), w.waveShaper.connect(w.gainNode)) : w.analyser.connect(w.gainNode), w.gainNode.connect(w.analyserAlt), w.analyserAlt.connect(j.destination), d([w.analyser, w.analyserAlt], r), t.onMove = function (a) {
                    K = a, O = a > 0, h(), w.waveShaper.curve = e(K), J.text(parseInt(K / 10))
                }, w.source.start()
            }

            function h() {
                O ? (w.gainNode.gain.value = .7, w.analyser.disconnect(), w.analyser.connect(w.convolver), w.convolver.connect(w.waveShaper), w.waveShaper.connect(w.gainNode), H.text("ON")) : (w.gainNode.gain.value = 1, w.analyser.disconnect(), w.convolver.disconnect(), w.waveShaper.disconnect(), w.analyser.connect(w.gainNode), H.text("OFF"))
            }

            function i() {
                u = f(m[0]), v = f(m[0]), u.source.loopStart = .5, u.source.loopEnd = 1.5, u.source.playbackRate.value = y, u.source.connect(u.analyser), u.analyser.connect(u.gainNode), u.gainNode.connect(j.destination), v.source.connect(v.gainNode), v.gainNode.connect(v.analyser), u.gainNode.gain.value = Q ? .4 : 1, u.source.start(0), v.source.start(0), d([v.analyser, u.analyser], q), s.onMove = function (a) {
                    y = a, u && (u.source.playbackRate.value = y), I.text(parseInt(100 * (y - .5), 10))
                }
            }

            var j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q;
            j = window.AudioContext ? new window.AudioContext : new window.webkitAudioContext, m = [], o = document.querySelector("#engineVisualizer"), q = o.getContext("2d"), p = document.querySelector("#narratorVisualizer"), r = p.getContext("2d"), B = $("#audioEngineStartStop"), D = $("#audioNarratorStartStop"), G = $("#throttleControl"), E = $("#distortionControl"), F = $("#radioFilterControl"), C = $(".switchGroup"), H = $("#radioFXDisplay span"), I = $("#throttleDisplay span"), J = $("#distortionDisplay span"), z = "audioPlaying", A = "webaudio-activeControl", y = .9, K = 250, L = .6, Q = !1, P = !0, O = !0, x = "engine", k = [Modernizr.audio.m4a ? "audio/engine.m4a" : "audio/engine.ogg", Modernizr.audio.m4a ? "narration/03_hintAfterDelay.m4a" : "narration/03_hintAfterDelay.ogg", "audio/telephone.wav"], b.prototype.loadBuffer = function (a, b) {
                var c = new XMLHttpRequest;
                c.open("GET", a, !0), c.responseType = "arraybuffer";
                var d = this;
                c.onload = function () {
                    d.context.decodeAudioData(c.response, function (c) {
                        return c ? (d.bufferList[b] = c, void(++d.loadCount === d.urlList.length && d.onload(d.bufferList))) : void console.log("error decoding file data: " + a)
                    }, function (a) {
                        console.error("decodeAudioData error", a)
                    })
                }, c.onerror = function () {
                    console.log("BufferLoader: XHR error")
                }, c.send()
            }, b.prototype.load = function () {
                for (var a = 0; a < this.urlList.length; ++a)this.loadBuffer(this.urlList[a], a)
            }, n = new b(j, k, function (a) {
                m = a
            }), s = new a.controls.SliderControl($("#enginePitchSlider"), {
                min: .9,
                max: 1.4,
                inc: .005,
                initialValue: y,
                sliderWidth: 300
            }), t = new a.controls.SliderControl($("#distortionSlider"), {
                min: 0,
                max: 1e3,
                inc: 5,
                initialValue: 250,
                sliderWidth: 300
            }), D.on("click", function () {
                $(this).toggleClass(z), $(this).hasClass(z) ? g() : w.source.stop()
            }), B.on("click", function () {
                $(this).toggleClass(z), $(this).hasClass(z) ? i() : (u.source.stop(), v.source.stop())
            }), $(window).on("resize", c), c(), n.load(), I.text(parseInt(100 * (y - .5), 10)), J.text(parseInt(K / 10))
        }

        a.exports.learnWebAudio = b
    }(), function () {
        function b() {
            function b(a, b, c, d, e, f, g, h) {
                var i = a.createRadialGradient(b, c, 0, b, c, d);
                i.addColorStop(0, "rgba(" + e + ", " + f + ", " + g + ", " + h + ")"), i.addColorStop(1, "rgba(" + e + ", " + f + ", " + g + ", " + C + ")"), a.beginPath(), a.arc(b, c, d, 0, 2 * Math.PI), a.fillStyle = i, a.fill(), a.closePath()
            }

            function c(a, b, c) {
                switch (a) {
                    case"brush":
                        u.globalCompositeOperation = b, v.globalCompositeOperation = b, w = "destination-out" === b ? v : u, v.globalAlpha = "destination-out" === b ? 1 : A;
                        break;
                    case"size":
                        s.style.cursor = "url(images/learn/brush" + c + "x" + c + ".svg) " + b + " " + b + ", default", z = b, n = z, o = n / 2;
                        break;
                    case"hardness":
                        D = b, B = b / 100 * 1.04, C = 25 * (B - 1)
                }
            }

            function d() {
                x.push(t.toDataURL())
            }

            function e() {
                if (x.length > 0) {
                    var a = new Image;
                    a.src = x.pop(), v.save(), v.globalAlpha = 1, v.globalCompositeOperation = "source-over", f(), v.drawImage(a, 0, 0), v.restore()
                }
            }

            function f() {
                v.clearRect(0, 0, t.width, t.height), v.fillStyle = "#000000", v.fillRect(0, 0, t.width, t.height)
            }

            function g(b) {
                "clear" === b ? (d(), f()) : "undo" === b && e(), a.events.trigger("brushUpdate")
            }

            function h() {
                return ((100 - D) / 7.5 + z) * (1 / r)
            }

            function i() {
                window.clearTimeout(m), m = setTimeout(j, 300)
            }

            function j() {
                var a = $("#canvas");
                s.width = a.width(), s.height = a.height(), t.width = a.width(), t.height = a.height(), f()
            }

            var k, l, m, n, o, p = 0, q = 0, r = 1, s = (document.querySelector("img"), document.querySelector("#canvasOverlay")), t = document.querySelector("#canvas"), u = s.getContext("2d"), v = t.getContext("2d"), w = u, x = [], y = 250, z = 20, A = .15, B = .2, C = 0, D = 65, E = !1;
            v.globalAlpha = .15, s.style.opacity = v.globalAlpha, s.addEventListener("mousedown", function (c) {
                E = !0, k = c.offsetX, l = c.offsetY, n = h(), d(), b(w, k, l, n, y, y, y, B), a.events.trigger("brushUpdate"), c.preventDefault()
            }), s.addEventListener("mouseup", function () {
                E = !1, w === u && (v.save(), v.globalAlpha = A, v.drawImage(s, 0, 0), w.clearRect(0, 0, s.width, s.height), v.restore())
            }), s.addEventListener("mousemove", function (c) {
                if (E === !0) {
                    p = c.offsetX, q = c.offsetY;
                    var d = Math.sqrt(Math.pow(k - p, 2) + Math.pow(l - q, 2));
                    if (d >= 4) {
                        for (var e = 0; d > e; e += 4) {
                            var f = e / d;
                            b(w, k * f + p * (1 - f), l * f + q * (1 - f), n, y, y, y, B)
                        }
                        k = p, l = q
                    }
                    a.events.trigger("brushUpdate")
                }
                c.preventDefault()
            }), $(".webgl-tool").on("click", function () {
                var a = $(this);
                $(this).hasClass("webgl-flow-tool") ? g(a.data("value")) : (a.parent().find(".webgl-selectedTool").removeClass("webgl-selectedTool"), a.addClass("webgl-selectedTool"), c(a.data("type"), a.data("value"), a.data("brush")))
            }), $(".webgl-selectedTool").each(function () {
                c($(this).data("type"), $(this).data("value"), $(this).data("brush"))
            }), $(window).on("resize", i), j()
        }

        a.exports.learnWebGL = function () {
            b();
            var c = 30, d = new a.game.MeshSampleWorld({
                subdivisions: c,
                textureUrl: "images/learn/heightsample.jpg"
            });
            d.start(), d.updateHeightMap(), a.events.on("brushUpdate", _.debounce(function () {
                d.updateHeightMap()
            }, 500));
            var e = new a.controls.SliderControl($("#subdivisionsSlider"), {
                min: 10,
                max: 100, inc: 10, initialValue: c, sliderWidth: 100
            });
            e.onMove = function (a) {
                d.subdivisions = a, d.updateHeightMap(), $("#subdivisionsDisplay").text(a)
            };
            var f = $("#textureToggle").on("click", function (a) {
                f.toggleClass("on"), d.toggleWireframe(!f.hasClass("on")), d.updateHeightMap()
            })
        }
    }()
}();