//  function ConvertLink(viewableLink) {
    // const baseUrl = 'https://drive.google.com/uc?export=download&id=';

    // const url = new URL(viewableLink);

//     const fileId = url.searchParams.get('id');

//     return `${baseUrl}${fileId}`

// }

module.exports =  function ConvertLink(viewableLink){
    
    const baseUrl = 'https://drive.google.com/uc?export=download&id=';

    const regex = /\/d\/([^\/]+)/;

    const match = viewableLink.match(regex);
    const fileId = match[1]   

    return `${baseUrl}${fileId}`
}

