import '../style/Graph.css';
import { ForceGraph3D } from 'react-force-graph';
import { Data } from './GraphData/graphData';
import {
  CSS2DRenderer,
  CSS2DObject,
} from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';
import { useEffect, useState, useCallback } from 'react';
import { WeightedGraph } from './GraphData/Logic';
import scroll from '../assets/scroll.png';
import left from '../assets/left-click.png';
import SpriteText from 'three-spritetext';


const Graph = () => {
  const extraRenderers = [new CSS2DRenderer()];
  const [info, setInfo] = useState(Data);
  const [WeightedGraph1, setWeightedGraph1] = useState(null);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [inputnodevalue, setInputNodeValue] = useState('');
  const [inputnodelink1, setInputNodeLink1] = useState('');
  const [inputnodelinksize, setInputNodeLinkSize] = useState('');
  const [shortestPath, setShortestPath] = useState([]);
  const [error, setError] = useState('');

  const randomize = () => {
    let nodeValues = new Set();
    const newnodes = info.nodes.map((item, i) => {
      let value;
      do {
        value = Math.floor(Math.random() * 850 + (i + 1));
      } while (nodeValues.has(value));
      nodeValues.add(value);
      return { ...item, value, id: value, color: 'green' };
    });

    let linkCount = {};
    for (let node of newnodes) {
      linkCount[node.id] = 0;
    }

    const newlinks = [];
    for (let node of newnodes) {
      let otherNodes = newnodes.filter(
        (n) => n.id !== node.id && linkCount[n.id] < 3
      );
      if (otherNodes.length > 0) {
        let otherNode =
          otherNodes[Math.floor(Math.random() * otherNodes.length)];
        let link = {
          size: Math.floor(Math.random() * 20 + 1),
          color: 'purple',
          source: node,
          target: otherNode,
        };
        newlinks.push(link);
        linkCount[node.id]++;
        linkCount[otherNode.id]++;
      }
    }

    for (let node of newnodes) {
      if (linkCount[node.id] < 3) {
        let otherNodes = newnodes.filter(
          (n) =>
            n.id !== node.id &&
            linkCount[n.id] < 3 &&
            !newlinks.some(
              (link) =>
                (link.source.id === node.id && link.target.id === n.id) ||
                (link.source.id === n.id && link.target.id === node.id)
            )
        );
        if (otherNodes.length > 0) {
          let otherNode =
            otherNodes[Math.floor(Math.random() * otherNodes.length)];
          let link = {
            size: Math.floor(Math.random() * 20 + 1),
            color: 'purple',
            source: node,
            target: otherNode,
          };
          newlinks.push(link);
          linkCount[node.id]++;
          linkCount[otherNode.id]++;
        }
      }
    }

    setInfo({ nodes: newnodes, links: newlinks });

    setShortestPath([]);
    setError('');
  };

  const Addinfo = () => {
    let wg = new WeightedGraph();
    info.nodes.map((item) => wg.addVertex(item.value));

    info.links.map((item) => {
      if (item.source.value) {
        wg.addEdge(item.source.value, item.target.value, item.size);
      } else {
        wg.addEdge(item.source, item.target, item.size);
      }
    });

    setWeightedGraph1(wg);
  };

  const shortestPathbetweentwonodes = (num1, num2) => {
    let wg1 = new WeightedGraph();
    wg1 = WeightedGraph1;
    if (wg1.adjacencyList[num1] && wg1.adjacencyList[num2]) {
      let originalnodes = info.nodes.filter((item) => (item.color = 'green'));
      let originallinks = info.links.filter((link) => (link.color = 'purple'));

      setInfo({ nodes: originalnodes, links: originallinks });
      setShortestPath(wg1.Dijkstra(num1, num2));
      changecolor(wg1.Dijkstra(num1, num2));
      setError('');
      setInput1('');
      setInput2('');
    } else {
      setError('Make sure both nodes exist in graph');
    }
  };

  const changecolor = (shortestPath) => {
    let index = 0;
    const shortestPathNodesAndLinks = shortestPath.map((nodeValue, i) => {
      const node = info.nodes.find(
        (node) =>
          node.value === nodeValue || node.value.toString() === nodeValue
      );
      const links =
        i < shortestPath.length - 1
          ? info.links.filter(
              (link) =>
                ((link.source.value === nodeValue ||
                  link.source.value.toString() === nodeValue) &&
                  (link.target.value === shortestPath[i + 1] ||
                    link.target.value.toString() === shortestPath[i + 1])) ||
                ((link.target.value === nodeValue ||
                  link.target.value.toString() === nodeValue) &&
                  (link.source.value === shortestPath[i + 1] ||
                    link.source.value.toString() === shortestPath[i + 1]))
            )
          : [];
      return { node, links };
    });

    const intervalId = setInterval(() => {
      if (index >= shortestPathNodesAndLinks.length) {
        clearInterval(intervalId);
        return;
      }
      const { node, links } = shortestPathNodesAndLinks[index];
      if (node) {
        node.color = 'red';
        setInfo({ nodes: [...info.nodes], links: [...info.links] });
      }
      setTimeout(() => {
        if (links.length > 0) {
          for (let link of links) {
            link.color = 'blue';
          }
          setInfo({ nodes: [...info.nodes], links: [...info.links] });
        }
      }, 300);
      index++;
    }, 400);
  };

  const AddNode = (value, link, size) => {
    setInfo({
      nodes: [
        ...info.nodes,
        {
          id: parseInt(value),
          value: parseInt(value),
          color: 'green',
        },
      ],
      links: [
        ...info.links,
        {
          source: parseInt(link),
          target: parseInt(value),
          size: parseInt(size),
          color: 'purple',
        },
      ],
    });

    setInputNodeValue('');
    setInputNodeLink1('');
    setInputNodeLinkSize('');
  };

  const handleRemoveNode = useCallback(
    (node) => {
      const newLinks = info.links.filter(
        (l) => l.source !== node && l.target !== node
      );
      const newnodes = info.nodes.filter((n) => n.id !== node.id);

      setInfo({ nodes: newnodes, links: newLinks });
    },
    [info, setInfo]
  );

  useEffect(() => {
    Addinfo();
  }, [info]);

  return (
    <div className="graph">
      <ForceGraph3D
        backgroundColor={'lightgrey'}
        onNodeClick={handleRemoveNode}
        showNavInfo={true}
        width={1000}
        height={600}
        nodeVal={10}
        enableNodeDrag={false}
        graphData={info}
        linkWidth={1}
        extraRenderers={extraRenderers}
        linkColor={(link) => {
          return link.color;
        }}
        nodeLabel={'value'}
        nodeColor={(node) => {
          return node.color;
        }}
        nodeRelSize={2}
        nodeResolution={15}
        nodeThreeObject={(node) => {
          const nodeEl = document.createElement('div');
          nodeEl.className = 'node';
          nodeEl.textContent = node.value;
          return new CSS2DObject(nodeEl);
        }}
        nodeThreeObjectExtend={true}
        linkThreeObjectExtend={true}
        linkThreeObject={(link) => {
          const sprite = new SpriteText(link.size);
          sprite.color = 'black';
          sprite.textHeight = 3;
          return sprite;
        }}
        linkPositionUpdate={(sprite, { start, end }) => {
          const middlePos = Object.assign(
            ...['x', 'y', 'z'].map((c) => ({
              [c]: start[c] + (end[c] - start[c]) / 2,
            }))
          );

          Object.assign(sprite.position, middlePos);
        }}
      />
      <div className="sidepanel">
        <button onClick={() => randomize()}> Randomize</button>
        <div className="input">
          {' '}
          <input
            type="number"
            onChange={(e) => setInput1(e.target.value)}
            value={input1}
            placeholder="Enter the start node"
          />
          <input
            type="number"
            onChange={(e) => setInput2(e.target.value)}
            value={input2}
            placeholder="Enter the finish node"
          />
        </div>

        <button onClick={() => shortestPathbetweentwonodes(input1, input2)}>
          {' '}
          ShortestPath
        </button>
        <div className="shortest">{shortestPath.join('==>')}</div>
        <div className="error">{error}</div>
        <div className="AddNewNode">
          <input
            type="number"
            onChange={(e) => setInputNodeValue(e.target.value)}
            value={inputnodevalue}
            placeholder="Enter the node value"
          />
          <input
            type="number"
            onChange={(e) => setInputNodeLink1(e.target.value)}
            value={inputnodelink1}
            placeholder="Enter the node you want to link it to"
          />
          <input
            type="number"
            onChange={(e) => setInputNodeLinkSize(e.target.value)}
            value={inputnodelinksize}
            placeholder="Enter the link size"
          />
          <button
            onClick={() =>
              AddNode(inputnodevalue, inputnodelink1, inputnodelinksize)
            }
          >
            Add node
          </button>
        </div>
        <div className="RemoveNode">To Remove: Just click on a Node.</div>
        <div className="key">
          <div className="zoom">
            <img width={40} height={35} src={scroll} />
            <h6>Zoom In/Out</h6>
          </div>
          <div className="zoom">
            <img width={40} height={35} src={left} />
            <h6>Click to rotate</h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graph;
