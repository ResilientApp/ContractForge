import React from 'react';
import { Copy, Download, X } from 'lucide-react';
import Modal from 'react-modal';

interface JSONModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonConfig: string;
  contractName: string;
  exampleConfig: string;
}

const JSONModal: React.FC<JSONModalProps> = ({ isOpen, onClose, jsonConfig, contractName, exampleConfig }) => {
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const downloadJSON = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="json-modal"
      overlayClassName="json-modal-overlay"
    >
      <div className="modal-header">
        <h3>ResVault Deployment JSON</h3>
        <button onClick={onClose} className="close-button">
          <X size={20} />
        </button>
      </div>
      
      <div className="modal-content">
        <div className="json-sections">
          <div className="json-section">
            <h4>ResVault Deployment JSON</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Replace the example values with your actual contract parameters:
            </p>
            <div className="json-display">
              <pre>{jsonConfig}</pre>
            </div>
            <div className="section-actions">
              <button onClick={() => copyToClipboard(jsonConfig)} className="action-button copy-button">
                <Copy size={16} />
                Copy JSON
              </button>
              <button onClick={() => downloadJSON(jsonConfig, `${contractName}_config.json`)} className="action-button download-button">
                <Download size={16} />
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default JSONModal; 