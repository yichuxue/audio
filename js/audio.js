/* 
* @Author: Marte
* @Date:   2017-06-25 17:21:13
* @Last Modified by:   Marte
* @Last Modified time: 2017-07-15 23:09:57
*/

;(function($){
    var fnName = 'audioPlay';
    var config = {
        /* 中间内容部分 */
        view : ".audio-view",
        /* 歌曲播放标题 */
        title : ".audio-title",
        /* 音乐播放缩略图 */
        cover : ".audio-cover",
        /* 是否自动播放 */
        autoPlay : false,
        /* 声音大小调节器  》 音乐大小整个进度条 */
        volume : {
            volumeView : ".audio-set-volume",
            volumeBox : ".volume-box",
        },
        /* 开始时间  结束时间 */
        timeView : {
            thisTime : ".audio-this-time",
            countTime : '.audio-count-time',
        },
        setbacks : {
            /* 音乐播放整个进度条盒子 */
            setbacks : '.audio-setbacks',
            /* 已播放时间的进度条 */
            thisSetbacks : '.audio-this-setbacks',
            /* 音乐播放整个进度条 */
            cacheSetbacks : ".audio-cache-setbacks",
            /* 现在的声音大小 */
            volumeSetbacks : ".volume-box > i",
            /* 声音滑块 */
            volumeCircular : ".volume-box > i span"
        },
        button : {
            /* 声音显示/隐藏按钮 */
            volume : ".audio-volume",
            /* 音乐进度条滑块 */
            backs : ".audio-backs-btn",
            /* 上一曲 */
            prev : ".audio-prev",
            /* 播放 */
            play : ".audio-play",
            /* 下一曲 */
            next : ".audio-next",
            /* 音乐列表按钮 */
            menu : ".audio-menu",
            /* 音乐列表关闭按钮 */
            menuClose : ".menu-close"
        },
        menu : {
            /* 音乐列表 */
            menuView : '.audio-list',
            /*  */
            colse : '.close',
            /* 音乐列表ul */
            list : '.audio-inline'
        },
        /* 创建一个空对象 */
        song:null
    };

    var songEq = 0,
        volumeSize = 0.7;

    window[fnName] = function(setConfig){
        //设置属性值
        if(typeof(setConfig) == "object"){
            for(var n in setConfig){
                config[n] = setConfig[n];
            }
        }
        var _this = config,
            playDate;

        var cover = $(_this.cover),
            title = $(_this.title),
            thisTime = $(_this.timeView.thisTime),
            countTime = $(_this.timeView.countTime),
            thisSetbacks = $(_this.setbacks.thisSetbacks),
            cacheSetbacks = $(_this.setbacks.cacheSetbacks),
            setbacks = $(_this.setbacks.setbacks),
            volumeCircular = $(_this.setbacks.volumeCircular),
            volumeSetbacks = $(_this.setbacks.volumeSetbacks),
            volumeBox = $(_this.volume.volumeBox),
            play = $(_this.button.play),
            prev = $(_this.button.prev),
            next = $(_this.button.next),
            menuBtn = $(_this.button.menu),
            volume = $(_this.button.volume),
            menuClose = $(_this.button.menuClose),
            backs = $(_this.button.backs);

        /* 创建一个播放器 */
        _this.createAudio = function(){
            if(!_this.audio){
                /* 将音频播放实例化 */
                _this.audio = new Audio();
            }

            /* 定必对象song */
            var song = config.song;
            /* 如果没有歌曲结束当前音乐播放 */
            if(!song){
                alert('当前歌单没有歌曲!!!');
                return false;
            }

            /* 暂停音乐 */
            _this.stopAudio();
            /* 获取第一手音乐的路径地址 */
            _this.audio.src = song[songEq].src;
            /* 设置音量大小为百分比 */
            _this.volumeSet();
            /* 设置第一首音乐标题的名字 */
            title.text(song[songEq].title || '未知歌曲');
            /* 设置音乐缩略图 */
            cover.css({
                'backgroundImage' : 'url('+(song[songEq].cover || '')+')'
            });

            /* 设置音乐总时间 */
            function setDuration(){
                /* 当前资源的长度是否为数字 */
                if(isNaN(_this.audio.duration)){
                    /* 不是数字则每隔50毫秒调用当前函数一次 */
                    setTimeout(setDuration,50);
                }else{
                    /* 是数字，然后设置总时间 */
                    countTime.text(_this.conversion(_this.audio.duration));
                }
            }
            /* 调用音乐总时间 */
            setDuration(_this.audio.duration);
            /* 设置当前播放时间 */
            thisTime.text(_this.conversion(_this.audio.currentTime));
            /* 音频播放完成后触发 */
            _this.audio.onended = function(){
                /* 播放完成后过一秒钟执行 */
                setTimeout(function(){
                    /* 音乐下标 ++ */
                    ++songEq;
                    /* 如果音乐下标小于音乐的长度，那么返回当前下标，否则返回第一首 */
                    songEq = (songEq < _this.song.length) ? songEq : 0;
                    /*  */
                    _this.selectMenu(songEq,true);
                },1000);
            }
        }

        var timeAudio;
        _this.playAudio = function(){
            /* 如果有音乐 */
            if(_this.audio){
                /* 当前没有时间 或者 当前时间减去播放时间大于>100 */
                if(!playDate || (Date.now() - playDate) > 100){
                    /* 默认设置当前时间为播放时间 */
                    playDate = Date.now();
                    /*  */
                    (!_this.audio.paused) || _this.audio.pause();
                    /* 自动播放 */
                    _this.audio.play();
                    /* 给播放暂停按钮换上播放按钮并且监听，当被点击的时候 */
                    play.addClass('audio-stop').one('click',function(){
                        /* 被点击的时候停止播放 */
                        _this.stopAudio();
                        /* 移除播放样式，当再次点击时 */
                        $(this).removeClass('audio-stop').one('click',function(){
                            /* 恢复到播放状态 */
                            _this.playAudio();
                        });
                    });
                    /* 设置定时器 每500毫秒执行一次 */
                    timeAudio = setInterval(function(){
                        /* 当可用数据足以播放的时候 */
                        if(_this.audio.readyState == 4){
                            /* 缓冲数据长度   宽度 = 视频首个缓冲的范围  /  视频总长度  获得宽度百分比 */
                            cacheSetbacks.css({
                                'width' : (_this.audio.buffered.end(0) / _this.audio.duration)*100+"%"
                            });
                        }
                        /* 播放进度条的宽度：当前播放的时间 / 视频总长度  获得宽度百分比 */
                        thisSetbacks.css({
                            'width' : (_this.audio.currentTime / _this.audio.duration)*100+"%"
                        });
                        /* 设置当前播放位置的时间 */
                        thisTime.text(_this.conversion(_this.audio.currentTime));
                    },500);
                }else{
                    if(_this.audio.paused){
                        setTimeout(function(){
                            _this.playAudio();
                        },16);
                    }
                }           
            }
        }

        _this.stopAudio = function(){
            /* 如果没有设置播放时间或者  当前时间 - 播放时间 > 100 */
            if(!playDate || (Date.now() - playDate) > 100){
                /* 获取当前时间 */
                playDate = Date.now();
                /* 暂停 */
                _this.audio.pause();
                /* 更改audio播放的按钮的状态 */
                play.removeClass('audio-stop');
                /* 清除定时器 */
                clearInterval(timeAudio);
            }else{
                setTimeout(function(){
                    _this.stopAudio();
                },50);
            }       
        }

        /* 设置时间格式 */
        _this.conversion = function(num){
            /* 如果数字小鱼10，则在前面补0，如果大于10直接返回num */
            function changInt(num){
                return (num < 10) ? '0'+num : num;
            }
            /* 返回分钟 + 秒数 */
            return changInt(parseInt(num/60))+":"+ changInt(Math.floor(num%60));
        }

        /* 更新音乐 */
        _this.upMenu = function(){
            
            var song = _this.song,
                /* 获取音乐列表ul，清除ul下面的所有内容 */
                inline = $(_this.menu.list).empty();

            for(var i in song){
                /* 通过循环添加，将li添加进入ul里面 */
                inline.append("<li><a href='javascript:;'>"+(song[i].title || '未知歌曲')+"</a></li>");
            }
            /* 取消所有li的绑定点击事件，并添加上点击监听事件 */
            inline.find(">li").unbind('click').on('click',function(){
                /* 重新设置音乐信息 */
                _this.selectMenu($(this).index(),true);
            });
        }

        _this.selectMenu = function(num,_bool){
            /* 当前音乐下标 */
            songEq = num;
            /* 重新设置音乐信息 */
            _this.createAudio();

            (_bool) && _this.playAudio();
        }

        /* 设置音量百分比 */
        _this.volumeSet = function(){
            /* 固定音乐音量大小 */
            _this.audio.volume = volumeSize;
            /* 设置音量大小以百分比显示 */
            volumeSetbacks.css({
                'height' : volumeSize*100 + "%"
            });
        }

        /* 添加新的音乐 */
        _this.newSong = function(_new,_bool){
            /* 判断是否为对象 */
            if( typeof(_new) == 'object' ){
                /* 如果有音乐路径 */
                if(_new.src){
                    /* 如果音乐存在 */
                    if(_this.song){
                        /* 将新的音乐添加进入 */
                        _this.song.push(_new);
                    }else{
                        /* 如果目录没有音乐，转换为数组，添加进入 */
                        _this.song = [_new];
                    }
                    /* 更新音乐列表 */
                    _this.upMenu();
                    /* 并且重新设置音乐信息 */
                    (_bool) && _this.selectMenu(_this.song.length-1,true);
                }else{
                    alert('对象缺省src属性');
                }
            }else{
                alert('这不是一个对象');
            }
        }

        var volumeTime;
        /* 对音量进度条进行一个鼠标按下的监听事件  */
        volumeBox.on('mousedown',function(){
            /* 如果有音频对象 */
            if(_this.audio){
                /*  EndY = 音量总高度值  */
                var Y,EndY = parseInt(volumeBox.css('height')),goY;
                /* 对进度条进行鼠标滑动和点击监听 */
                volumeBox.on('mousemove click',function(e){
                    /* 清除定时器 */
                    clearTimeout(volumeTime);
                    /* Y = 当前坐标相对于被点击盒子顶部的距离 */
                    Y = (e.clientY-(volumeBox.offset().top-$(document).scrollTop()));
                    /* 如果y大于0 y>EndY? y = EndY 否则y等于 0 */
                    /* --------------------- 点赞 --------------------- */
                    Y = (Y > 0) ? (Y > EndY) ? EndY : Y : 0;
                    
                    goY = Y/EndY;
                    /* 最终返回音量值 */
                    volumeSize = 1 - goY;
                    /* 设置音量百分比 */
                    _this.volumeSet();
                });
                /* 监听一次当鼠标抬起的时候 */
                volumeBox.one('mouseup',function(){
                    /* 移除鼠标移动事件 */
                    volumeBox.unbind('mousemove');
                    /* 监听当鼠标移开时 */
                }).on('mouseout',function(){
                    /* 经过500毫秒执行 移除鼠标移动事件 */
                    volumeTime = setTimeout(function(){

                        volumeBox.unbind('mousemove');
                    },500);
                });
            }
        });

        /* 监听音乐进度条 当鼠标按下的时候 */
        setbacks.on('mousedown',function(){
            if(_this.audio){
                /* EndX = 获取进度条的总长度 */
                var X,EndX = parseInt(setbacks.css('width')),goX,mouseTime;
                /* 当鼠标移动或点击的时候 */
                setbacks.on('mousemove click',function(e){
                    /* 暂停播放 */
                    _this.stopAudio();
                    /* 清除掉 定时器执行的鼠标移动事件  */
                    clearTimeout(mouseTime);
                    /* X = 点击时候鼠标的位置距离被点击div的左边的距离 */
                    X = (e.clientX-setbacks.offset().left);
                    X = (X > 0) ? (X > EndX) ? EndX : X : 0;
                    
                    goX = X/EndX;
                    /* 最终返回 被点击之后的进度条的位置 */
                    thisSetbacks.css({
                        'width' : goX*100+"%"
                    });
                    /* 被点击之后的时间所在位置 */
                    _this.audio.currentTime = parseInt(goX*_this.audio.duration);
                    /* 设置当前点击之后的时间位置 */
                    thisTime.text(_this.conversion(_this.audio.currentTime));
                });
                /* 监听一次鼠标抬起的时候 */
                setbacks.one('mouseup',function(){
                    /* 执行 执行播放按钮 */
                    _this.playAudio();
                    /* 取消鼠标滑动时间 */
                    setbacks.unbind('mousemove');
                    /* 监听当鼠标移开的时候 */
                }).on('mouseout',function(){
                    /* 隔500毫秒执行播放按钮 并且去除鼠标移动事件 */
                    mouseTime = setTimeout(function(){

                        _this.playAudio();
                        setbacks.unbind('mousemove');
                    },500);
                });
            }
        });

        /* 监听一次当鼠标点击执行播放 */
        play.one('click',function(){
            _this.playAudio();
        });
        /* 监听，当点击时如果元素已经显示，则隐藏反之元素如果已经隐藏，则显示 */
        menuBtn.on('click',function(){
            $(_this.menu.menuView).toggleClass('menu-show');
        });
        /* 上一曲 */
        prev.on('click',function(){
            --songEq;
            songEq = (songEq >= 0) ? songEq :  _this.song.length -1;
            /* 重新设置音乐信息 */
            _this.selectMenu(songEq,true);
        });
        /* 下一曲 */
        next.on('click',function(){         
            ++songEq;
            songEq = (songEq < _this.song.length) ? songEq : 0;
            _this.selectMenu(songEq,true);
        });
        /* 监听X按钮 点击事件，移除menu-show */
        menuClose.on('click', function(){
            $(_this.menu.menuView).removeClass('menu-show');
        });
        /* 监听音量键点击事件，如果显示则隐藏，如果隐藏则显示 */
        volume.on('click',function(){
            $(_this.volume.volumeView).toggleClass('audio-show-volume');
        });
        /* 更新列表 */
        _this.upMenu();
        /* 执行音乐播放 */
        _this.selectMenu(songEq,_this.autoPlay);
        /* 监听空格键 */
        $(document).on('keydown',function(event){
            if(event.keyCode == 32 ){
                //判断音乐是否是播放状态
                if(_this.audio.paused){
                    //暂停中
                    _this.playAudio();
                }else{
                    //播放中
                    _this.stopAudio();
                }
            }
        })
        return _this;
    }

})(jQuery)