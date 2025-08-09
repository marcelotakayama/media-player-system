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
import "../styles/media.css";

export default function MediaPage() {
  const [medias, setMedias] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);

  // edição
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
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">📁 Página de Mídias</h3>

      {/* Upload (drag-and-drop) controlado */}
    <Upload.Dragger
        name="file"
        multiple={false}
        accept="image/*,video/*,audio/*"
        showUploadList={false}
        // NÃO use onChange nem beforeUpload aqui
        customRequest={async ({ file, onSuccess, onError }) => {
            try {
            if (uploading) return;
            setUploading(true);

            await uploadMedia(file as File); // sua API
            await loadMedias();              // recarrega lista

            message.success("Mídia enviada com sucesso!");
            // avisa o antd que deu certo
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
        style={{ background: "#fafafa", borderRadius: 12 }}
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

      {/* Cards */}
      <div className="media-grid" style={{ marginTop: 16 }}>
        {medias.map((media) => (
          <div key={media.id} className="media-card">
            <div className="media-name">{media.nome}</div>
            <div className="media-type">{media.tipo || "—"}</div>
            <div className="media-desc">
              {media.descricao || <em>Sem descrição</em>}
            </div>

            {/* Ações: Ver | Editar | Excluir */}
            <Space size="small" style={{ marginTop: 8 }}>
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

      {/* Modal de edição */}
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
        destroyOnClose
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
