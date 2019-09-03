export const randomName = () => {
    let string = btoa(Math.random())
            .toLowerCase()
            .replace(/[^a-z]+/g, ""),
        length = string.length / 2;
    return string.slice(0, length) + "-" + string.slice(length);
};

export const till = async (time) => new Promise(resolve => setTimeout(resolve, time || 300));


function formatXML(xmlString, indent) {
    indent = indent || "\t"; //can be specified by second argument of the function

    var tabs = "";  //store the current indentation

    var result = xmlString.replace(
        /\s*<[^>\/]*>[^<>]*<\/[^>]*>|\s*<.+?>|\s*[^<]+/g, //pattern to match nodes (angled brackets or text)
        function (m, i) {
            m = m.replace(/^\s+|\s+$/g, "");  //trim the match just in case

            if (i < 38)
                if (/^<[?]xml/.test(m)) return m + "\n";  //if the match is a header, ignore it

            if (/^<[/]/.test(m))  //if the match is a closing tag
            {
                tabs = tabs.replace(indent, "");  //remove one indent from the store
                m = tabs + m;  //add the tabs at the beginning of the match
            } else if (/<.*>.*<\/.*>|<.*[^>]\/>/.test(m))  //if the match contains an entire node
            {
                //leave the store as is or
                // m = m.replace(/(<[^\/>]*)><[\/][^>]*>/g, "$1 />");  //join opening with closing tags of the same node to one entire node if no content is between them
                m = tabs + m; //add the tabs at the beginning of the match
            } else if (/<.*>/.test(m)) //if the match starts with an opening tag and does not contain an entire node
            {
                m = tabs + m;  //add the tabs at the beginning of the match
                tabs += indent;  //and add one indent to the store
            } else  //if the match contain a text node
            {
                m = tabs + m;  // add the tabs at the beginning of the match
            }

            //return m+"\n";
            //"\n" +
            return  m; //content has additional space(match) from header
        }//anonymous function
    );//replace

    return result;
}


let mapObjectToHTMLAttributes = (attributes) =>
    attributes ? Object.entries(attributes).reduce((previous, current) =>
        previous + ` ${current[0]}="${current[1]}"`, ""
    ) : "";


export const mount = async ({tag, Component, mountPoint, attributes = {}, children}) => {

    tag = tag || randomName();

    mountPoint = mountPoint || document.createElement("div");

    mountPoint.innerHTML = (`<${tag} ${mapObjectToHTMLAttributes(attributes) || ""}>${children || ""}</${tag}>`);

    document.body.appendChild(mountPoint);

    let node = mountPoint.firstChild;

    await node._mounted;

    await till(); //wait till the visibility classname is added;

    return {
        tag,
        mountPoint,
        node,
        shadowSnapshot: () => formatXML(node.shadowRoot.innerHTML),
        lightDomSnapshot: () => mountPoint.innerHTML,
        slots: node.shadowRoot.querySelectorAll('slot'),
        getSlotContent: (slot_id = "slot-0", node) => node.shadowRoot.getElementById(slot_id).parentNode.innerHTML
    }
};