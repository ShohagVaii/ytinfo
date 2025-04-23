document.getElementById("fetchInfo").addEventListener("click", async () => {
    const videoUrl = document.getElementById("videoUrl").value.trim();
    const videoId = extractVideoId(videoUrl);
 
    hideAll();
    if (!videoId) {
        showError("সঠিক YouTube ভিডিও লিংক দিন।");
        return;
    }

    showLoading();

    try {
        const apiKey = "AIzaSyBWsctEIxU_6xOSAucyH-b68CmviBEU3uE";

        const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status&id=${videoId}&key=${apiKey}`);
        const videoData = await videoRes.json();

        if (!videoData.items || videoData.items.length === 0) {
            showError("ভিডিও পাওয়া যায়নি।");
            return;
        }

        const video = videoData.items[0];
        const snippet = video.snippet;
        const stats = video.statistics;
        const content = video.contentDetails;
        const status = video.status;

        // ভিডিও তথ্য দেখাও
        document.getElementById("thumbnail").src = snippet.thumbnails.high.url;
        document.getElementById("title").textContent = snippet.title;
        document.getElementById("description").textContent = snippet.description;
        document.getElementById("viewCount").textContent = stats.viewCount || "N/A";
        document.getElementById("likeCount").textContent = stats.likeCount || "N/A";
        document.getElementById("dislikeCount").textContent = "YouTube এ আর dislike count দেখায় না";
        document.getElementById("commentCount").textContent = stats.commentCount || "N/A";
        document.getElementById("publishedAt").textContent = new Date(snippet.publishedAt).toLocaleString('bn-BD');
        document.getElementById("tags").textContent = snippet.tags ? snippet.tags.join(", ") : "N/A";
        document.getElementById("duration").textContent = formatDuration(content.duration);
        document.getElementById("videoCategory").textContent = snippet.categoryId;

        document.getElementById("liveStatus").textContent = snippet.liveBroadcastContent;
        document.getElementById("videoStatus").textContent = status.uploadStatus;
        document.getElementById("forKids").textContent = status.madeForKids ? "হ্যাঁ" : "না";
        document.getElementById("privacyStatus").textContent = status.privacyStatus;
        document.getElementById("licensedContent").textContent = status.license;
        document.getElementById("licensed").textContent = status.license;
        document.getElementById("isEmbedAllowed").textContent = status.embeddable ? "হ্যাঁ" : "না";
        document.getElementById("caption").textContent = content.caption;
        document.getElementById("countryRestriction").textContent = status.regionRestriction ? "আছে" : "নেই";
        document.getElementById("copyrightFree").textContent = "অনিশ্চিত";
        document.getElementById("ageRestricted").textContent = status.ageGating ? "হ্যাঁ" : "না";
        document.getElementById("contentRating").textContent = content.contentRating || "N/A";
        document.getElementById("definition").textContent = content.definition;
        document.getElementById("projection").textContent = content.projection;
        document.getElementById("dimension").textContent = content.dimension;

        // Like Ratio দেখানো
        document.getElementById("likeRatio").textContent = `${((stats.likeCount / (parseInt(stats.viewCount) || 1)) * 100).toFixed(2)}%`;

        // SEO ট্যাগ সাজেশন ও আয় অনুমান
        const rpm = 1.5; // আনুমানিক RPM (1.5 USD per 1K view)
        const earningInUSD = (parseInt(stats.viewCount || "0") / 1000) * rpm;
        const earningInBDT = earningInUSD * 125; // ১ USD = ১২৫ BDT

        document.getElementById("earningEstimate").textContent = `USD: ${earningInUSD.toFixed(2)} | BDT: ${earningInBDT.toFixed(2)}`;
        document.getElementById("seoTags").textContent = snippet.tags ? generateSeoTags(snippet.title, snippet.description, snippet.tags) : "N/A";

        // অতিরিক্ত Channel API প্রয়োজন
        const channelId = snippet.channelId;
        const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`);
        const channelData = await channelRes.json();
        const channel = channelData.items[0];

        document.getElementById("channelTitle").textContent = channel.snippet.title;
        document.getElementById("channelId").textContent = channel.id;
        document.getElementById("channelDescription").textContent = channel.snippet.description;
        document.getElementById("channelKeyword").textContent = channel.brandingSettings.channel.keywords || "N/A";
        document.getElementById("customUrl").textContent = channel.snippet.customUrl || "N/A";
        document.getElementById("country").textContent = channel.snippet.country || "N/A";
        document.getElementById("videosCount").textContent = channel.statistics.videoCount;
        document.getElementById("subscribersCount").textContent = channel.statistics.subscriberCount;
        document.getElementById("totalViews").textContent = channel.statistics.viewCount;
        document.getElementById("channelLogo").src = channel.snippet.thumbnails.high.url;

        document.getElementById("videoInfo").classList.remove("hidden");

    } catch (error) {
        console.error(error);
        showError("তথ্য আনতে সমস্যা হয়েছে।");
    } finally {
        hideLoading();
    }
});

function extractVideoId(url) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function formatDuration(isoDuration) {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const h = match[1] ? match[1] + " ঘণ্টা " : "";
    const m = match[2] ? match[2] + " মিনিট " : "";
    const s = match[3] ? match[3] + " সেকেন্ড" : "";
    return h + m + s;
}

function generateSeoTags(title, description, tags) {
    const words = (title + " " + description).toLowerCase().split(/\W+/);
    const filtered = words.filter(w => w.length > 3);
    const allTags = [...new Set([...filtered, ...tags])];
    return allTags.slice(0, 10).join(", ");
}

function showLoading() {
    document.getElementById("loading").classList.remove("hidden");
}
function hideLoading() {
    document.getElementById("loading").classList.add("hidden");
}
function showError(msg) {
    const errorDiv = document.getElementById("error");
    errorDiv.querySelector(".error-message").textContent = msg;
    errorDiv.classList.remove("hidden");
}
function hideAll() {
    document.getElementById("videoInfo").classList.add("hidden");
    document.getElementById("error").classList.add("hidden");
}
