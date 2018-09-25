(function() {
    'use strict'
    const videoEls = Array.from(document.querySelectorAll('video'))
    const videos = new Map()

    videoEls.forEach(video => {
        videos.set(video, {
            fullscreen: false,
            initialControls: video.controls,
            initialStyle: video.attributes.style && video.attributes.style.value,
            initialParent: video.parentNode,
            initialSibling: video.nextSibling,
        })
    })

    const applyWindowedFullscreen = el => {
        el.parentNode.removeChild(el)
        document.body.appendChild(el)
        el.style = 'position:fixed;left:0;top:0;width:100%;height:100%;background:black;z-index:99999;'
    }

    const toggleControls = el => el.attributes.controls ? el.removeAttribute('controls') : el.setAttribute('controls', '')

    videoEls.forEach(video => {
        // we will observe 'controls' attribute for change
        // in order to enable it if e.g. youtube decides
        // to remove the attribute.
        let observer = null
        const handleControlsChange = (mutations) => {
            for (let mut of mutations) {
                if (mut.attributeName === 'controls' && !video.controls) {
                    video.controls = true
                }
            }
        }

        video.addEventListener('click', e => {
            const props = videos.get(video)
            if (!e.ctrlKey) {
                if (props.fullscreen) {
                    video.paused ? video.play() : video.pause()
                }
                return
            }
            e.stopPropagation()

            if (!props.fullscreen) {
                observer = new MutationObserver(handleControlsChange)
                applyWindowedFullscreen(video)
                if (!props.initialControls) {
                    video.controls = true
                    observer.observe(video, { attributes: true })
                }
            } else {
                observer && observer.disconnect()
                video.style = props.initialStyle
                video.controls = props.initialControls
                document.body.removeChild(video)

                if (props.initialSibling) {
                    props.initialParent.insertBefore(video, props.initialSibling)
                } else {
                    props.initialParent.appendChild(video)
                }
            }

            props.fullscreen = !props.fullscreen
        })
    })
})()
