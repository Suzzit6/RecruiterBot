//  function ConvertLink(viewableLink) {
    // const baseUrl = 'https://drive.google.com/uc?export=download&id=';

    // const url = new URL(viewableLink);

//     const fileId = url.searchParams.get('id');

//     return `${baseUrl}${fileId}`

// }

module.exports = function ConvertLink(viewableLink) {
    const baseUrl = 'https://drive.google.com/uc?export=download&id=';
  
    // Regex for format: https://drive.google.com/file/d/FILE_ID/view
    const regexFile = /\/d\/([^\/]+)/;
    // Regex for format: https://drive.google.com/open?id=FILE_ID
    const regexOpen = /open\?id=([^&]+)/;
  
    let match = viewableLink.match(regexFile);
    if (!match) {
        match = viewableLink.match(regexOpen);
    }
    console.log(match)
  
    if (match && match[1]) {
      const fileId = match[1];
      console.log(`${baseUrl}${fileId}`)
      return `${baseUrl}${fileId}`;
    } else {
      throw new Error('Invalid Google Drive URL');
    }
  }

