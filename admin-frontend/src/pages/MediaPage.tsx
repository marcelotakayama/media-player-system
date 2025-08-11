import { useEffect, useState } from "react";
import {
  uploadMedia,
  fetchMedias,
  updateMedia,
  deleteMedia,
  type Media,
} from "../services/mediaService";
import {
  Upload,
  Button,
  message,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
} from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./media.css";

export default function MediaPage() {
  const [medias, setMedias] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Media | null>(null);
  const [form] = Form.useForm();

  const loadMedias = async () => {
    const data = await fetchMedias();
    setMedias(data);
  };

  useEffect(() => {
    loadMedias();
  }, []);

  const openEdit = (m: Media) => {
    setEditing(m);
    form.setFieldsValue({
      nome: m.nome,
      descricao: m.descricao,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!editing) return;

      await updateMedia({
        ...editing,
        nome: values.nome,
        descricao: values.descricao ?? "",
      });

      message.success("Mídia atualizada!");
      setIsModalOpen(false);
      setEditing(null);
      await loadMedias();
    } catch (err) {
      console.error(err);
      message.error("Não foi possível salvar.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id);
      message.success("Mídia excluída!");
      await loadMedias();
    } catch (e) {
      console.error(e);
      message.error("Não foi possível excluir a mídia.");
    }
  };

  return (
    <div className="media-page">
      <h3 className="media-header">📁 Página de Mídias</h3>

      <Upload.Dragger
        className="upload-drop"
        name="file"
        multiple={false}
        accept="image/*,video/*,audio/*"
        showUploadList={false}
        customRequest={async ({ file, onSuccess, onError }) => {
          try {
            if (uploading) return;
            setUploading(true);

            await uploadMedia(file as File); 
            await loadMedias();          

            message.success("Mídia enviada com sucesso!");
            onSuccess && onSuccess({}, new XMLHttpRequest());
          } catch (e: any) {
            console.error(e);
            message.error("Falha ao enviar a mídia.");
            onError && onError(e);
          } finally {
            setUploading(false);
          }
        }}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Arraste o arquivo para cá ou <b>clique para selecionar</b>
        </p>
        <p className="ant-upload-hint">Imagens, vídeos ou áudios.</p>

        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          disabled={uploading}
          style={{ marginTop: 8 }}
        >
          Enviar
        </Button>
      </Upload.Dragger>

      <div className="media-grid">
        {medias.map((media) => (
          <div key={media.id} className="media-card">
            <div className="media-name">{media.nome}</div>
            <div className="media-type">{media.tipo || "—"}</div>
            <div className="media-desc">
              {media.descricao || <em className="muted">Sem descrição</em>}
            </div>

            <Space size="small" className="media-actions">
              <a href={media.urlArquivo} target="_blank" rel="noreferrer">
                Ver arquivo
              </a>

              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => openEdit(media)}
                style={{ paddingInline: 4 }}
              >
                Editar
              </Button>

              <Popconfirm
                title="Excluir mídia"
                description="Tem certeza que deseja excluir esta mídia?"
                okText="Excluir"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(media.id)}
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  style={{ paddingInline: 4 }}
                >
                  Excluir
                </Button>
              </Popconfirm>
            </Space>
          </div>
        ))}
      </div>

      <Modal
        title="Editar mídia"
        open={isModalOpen}
        onOk={handleSave}
        okText="Salvar"
        cancelText="Cancelar"
        onCancel={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        destroyOnHidden  
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Nome"
            name="nome"
            rules={[{ required: true, message: "Informe o nome" }]}
          >
            <Input placeholder="Ex.: Banner Home" />
          </Form.Item>

          <Form.Item label="Descrição" name="descricao">
            <Input.TextArea
              placeholder="Informações adicionais"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
