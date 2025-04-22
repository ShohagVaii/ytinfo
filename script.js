document.getElementById('fetchInfo').addEventListener('click', async () => {
    const videoInput = document.getElementById('videoUrl').value.trim();
    const videoId = extractVideoId(videoInput);
    const apiKey = 'AIzaSyBWsctEIxU_6xOSAucyH-b68CmviBEU3uE';

    if (!videoId) {
        showError("ভিডিও আইডি সঠিক নয়!");
        return;
    }

    try {
        document.getElementById('loading').classList.remove('hidden'); // লোডিং শুরু
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,status&key=${apiKey}&id=${videoId}`;
        const videoRes = await fetch(videoUrl);
        const videoData = await videoRes.json();

        if (!videoData.items || videoData.items.length === 0) {
            showError("ভিডিও খুঁজে পাওয়া যায়নি!");
            return;
        }

        const video = videoData.items[0];
        const channelId = video.snippet.channelId;

        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&key=${apiKey}&id=${channelId}`;
        const channelRes = await fetch(channelUrl);
        const channelData = await channelRes.json();

        if (!channelData.items || channelData.items.length === 0) {
            showError("চ্যানেল তথ্য পাওয়া যায়নি!");
            return;
        }

        const channel = channelData.items[0];

        document.getElementById('videoInfo').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');

        // ভিডিও তথ্য
        document.getElementById('thumbnail').src = video.snippet.thumbnails.high.url;
        document.getElementById('title').textContent = video.snippet.title || 'N/A';
        document.querySelector('.copy-icon[data-copy="#title"]').setAttribute('data-copy', video.snippet.title || 'N/A');
        document.getElementById('description').textContent = video.snippet.description || 'N/A';
        document.querySelector('.copy-icon[data-copy="#description"]').setAttribute('data-copy', video.snippet.description || 'N/A');
        document.getElementById('viewCount').textContent = video.statistics.viewCount || 'N/A';
        document.getElementById('likeCount').textContent = video.statistics.likeCount || 'N/A';
        document.getElementById('dislikeCount').textContent = 'YouTube এ আর dislike count দেখায় না';
        document.getElementById('likeRatio').textContent = video.statistics.likeCount && video.statistics.viewCount
            ? `${((video.statistics.likeCount / video.statistics.viewCount) * 100).toFixed(2)}%` : 'N/A';
        document.getElementById('commentCount').textContent = video.statistics.commentCount || 'N/A';
        document.getElementById('publishedAt').textContent = new Date(video.snippet.publishedAt).toLocaleString('bn-BD');
        document.getElementById('duration').textContent = parseDuration(video.contentDetails.duration);
        document.getElementById('tags').textContent = video.snippet.tags ? video.snippet.tags.join(', ') : 'N/A';
        document.getElementById('liveStatus').textContent = video.snippet.liveBroadcastContent || 'N/A';
        document.getElementById('videoStatus').textContent = video.status.uploadStatus || 'N/A';
        document.getElementById('forKids').textContent = video.status.madeForKids ? 'হ্যাঁ' : 'না';
        document.getElementById('privacyStatus').textContent = video.status.privacyStatus || 'N/A';
        document.getElementById('licensedContent').textContent = video.contentDetails.licensedContent ? 'হ্যাঁ' : 'না';
        document.getElementById('licensed').textContent = video.status.license || 'N/A';
        document.getElementById('isEmbedAllowed').textContent = video.status.embeddable ? 'হ্যাঁ' : 'না';
        document.getElementById('caption').textContent = video.contentDetails.caption === 'true' ? 'হ্যাঁ' : 'না';
        document.getElementById('countryRestriction').textContent = video.contentDetails.regionRestriction
            ? JSON.stringify(video.contentDetails.regionRestriction) : 'নেই';
        document.getElementById('copyrightFree').textContent = video.contentDetails.licensedContent ? 'না' : 'হ্যাঁ';
        document.getElementById('ageRestricted').textContent = video.contentRating && video.contentRating.ytRating === 'ytAgeRestricted' ? 'হ্যাঁ' : 'না';
        document.getElementById('videoCategory').textContent = video.snippet.categoryId || 'N/A';

        // চ্যানেল তথ্য
        document.getElementById('channelTitle').textContent = channel.snippet.title || 'N/A';
        document.querySelector('.copy-icon[data-copy="#channelTitle"]').setAttribute('data-copy', channel.snippet.title || 'N/A');
        document.getElementById('channelId').textContent = channel.id || 'N/A';
        document.querySelector('.copy-icon[data-copy="#channelId"]').setAttribute('data-copy', channel.id || 'N/A');
        document.getElementById('channelDescription').textContent = channel.snippet.description || 'N/A';
        document.querySelector('.copy-icon[data-copy="#channelDescription"]').setAttribute('data-copy', channel.snippet.description || 'N/A');
        document.getElementById('channelKeyword').textContent = channel.brandingSettings?.channel?.keywords || 'N/A';
        document.getElementById('customUrl').textContent = channel.snippet.customUrl || 'N/A';
        document.getElementById('country').textContent = channel.snippet.country || 'N/A';
        document.getElementById('videosCount').textContent = channel.statistics.videoCount || 'N/A';
        document.getElementById('subscribersCount').textContent = channel.statistics.hiddenSubscriberCount ? 'গোপন' : (channel.statistics.subscriberCount || 'N/A');
        document.getElementById('totalViews').textContent = channel.statistics.viewCount || 'N/A';
        document.getElementById('channelLogo').src = channel.snippet.thumbnails.default.url;

        // SEO ট্যাগ সাজেশন
        const seoTags = suggestSeoTags(video.snippet.title, video.snippet.description, video.snippet.tags);
        document.getElementById('seoTags').textContent = seoTags.join(', ');

        // আনুমানিক আয়
        const estimatedEarning = estimateEarnings(parseInt(video.statistics.viewCount || 0));
        document.getElementById('earningEstimate').textContent = `${estimatedEarning} USD`;

    } catch (err) {
        showError("কিছু একটা ভুল হয়েছে! আবার চেষ্টা করুন।");
        console.error(err);
    } finally {
        document.getElementById('loading').classList.add('hidden'); // লোডিং শেষ
    }
});

function extractVideoId(url) {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
}

function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '') || '0';
    const minutes = (match[2] || '').replace('M', '') || '0';
    const seconds = (match[3] || '').replace('S', '') || '0';
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
}

function suggestSeoTags(title, description, tags) {
    const words = (title + ' ' + description + ' ' + (tags || []).join(' ')).toLowerCase().split(/\W+/);
    const freq = {};
    words.forEach(w => {
        if (w.length > 3) freq[w] = (freq[w] || 0) + 1;
    });

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const suggestions = sorted.slice(0, 10).map(item => item[0]);
    return suggestions;
}

function estimateEarnings(viewCount, rpm = 1.5) {
    return ((viewCount / 1000) * rpm).toFixed(2);
}

function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.classList.remove('hidden');
    document.querySelector('.error-message').textContent = message;
    document.getElementById('videoInfo').classList.add('hidden');
}