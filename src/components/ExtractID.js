export default function extractSheetId(url) {

    const regex = /\/d\/([a-zA-Z0-9-_]+)\/edit/;

    const match = url.match(regex);
    
    return match ? match[1] : null;
}



