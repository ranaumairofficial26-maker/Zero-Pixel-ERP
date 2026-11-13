--
-- PostgreSQL database dump
--

\restrict PcHFNXwGaPtIauGC4EZWwrtRBfZd3FzuFSCBU5x5pTzUoiDkyw05tKkTPcxyXik

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    user_id bigint NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(150) NOT NULL,
    role character varying(50) DEFAULT 'Admin'::character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: admin_users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.admin_users ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.admin_users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    client_id bigint NOT NULL,
    company_name character varying(200) NOT NULL,
    contact_person character varying(150),
    phone character varying(30) NOT NULL,
    email character varying(200),
    address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: clients_client_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.clients ALTER COLUMN client_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.clients_client_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cost_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_categories (
    category_id integer NOT NULL,
    category_name character varying(150) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    default_calculation_method character varying(50),
    default_rate numeric(18,4),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cost_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.cost_categories ALTER COLUMN category_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cost_categories_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estimate_cost_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estimate_cost_items (
    cost_item_id bigint NOT NULL,
    estimate_quantity_id bigint NOT NULL,
    category_id integer,
    expense_name_snapshot character varying(150) NOT NULL,
    calculation_method character varying(50) NOT NULL,
    unit_rate numeric(18,4) DEFAULT 0 NOT NULL,
    units numeric(12,3) DEFAULT 1 NOT NULL,
    amount numeric(18,4) DEFAULT 0 NOT NULL,
    notes text,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: estimate_cost_items_cost_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.estimate_cost_items ALTER COLUMN cost_item_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.estimate_cost_items_cost_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estimate_quantities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estimate_quantities (
    estimate_quantity_id bigint NOT NULL,
    estimate_id bigint NOT NULL,
    quantity integer NOT NULL,
    sheets_required numeric(12,2) NOT NULL,
    wastage_percentage numeric(8,2) DEFAULT 0 NOT NULL,
    paper_cost numeric(18,4) DEFAULT 0 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: estimate_quantities_estimate_quantity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.estimate_quantities ALTER COLUMN estimate_quantity_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.estimate_quantities_estimate_quantity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estimate_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estimate_results (
    result_id bigint NOT NULL,
    estimate_quantity_id bigint NOT NULL,
    paper_cost numeric(18,4) DEFAULT 0 NOT NULL,
    additional_expenses numeric(18,4) DEFAULT 0 NOT NULL,
    production_cost numeric(18,4) DEFAULT 0 NOT NULL,
    profit_amount numeric(18,4) DEFAULT 0 NOT NULL,
    subtotal numeric(18,4) DEFAULT 0 NOT NULL,
    tax_amount numeric(18,4) DEFAULT 0 NOT NULL,
    grand_total numeric(18,4) DEFAULT 0 NOT NULL,
    per_piece_cost numeric(18,4) DEFAULT 0 NOT NULL,
    calculated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: estimate_results_result_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.estimate_results ALTER COLUMN result_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.estimate_results_result_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    serial_number integer NOT NULL,
    gr_number character varying(50),
    description character varying(500) NOT NULL,
    quantity numeric(18,2) DEFAULT 1 NOT NULL,
    rate numeric(18,2) DEFAULT 0 NOT NULL,
    amount numeric(18,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.invoice_items ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.invoice_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    invoice_number character varying(50) NOT NULL,
    invoice_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    customer_id bigint NOT NULL,
    customer_name character varying(200) NOT NULL,
    company_name character varying(200),
    contact_number character varying(50) NOT NULL,
    email character varying(200),
    billing_address text,
    total numeric(18,2) DEFAULT 0 NOT NULL,
    advance numeric(18,2) DEFAULT 0 NOT NULL,
    balance numeric(18,2) DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ntn_number character varying(100),
    client_po_number character varying(100)
);


--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.invoices ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: paper_sizes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paper_sizes (
    paper_size_id integer NOT NULL,
    size_name character varying(100) NOT NULL,
    length_inches numeric(10,3),
    width_inches numeric(10,3),
    width_mm numeric(10,2),
    height_mm numeric(10,2),
    size_type character varying(50) DEFAULT 'StockPaper'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: paper_sizes_paper_size_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.paper_sizes ALTER COLUMN paper_size_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.paper_sizes_paper_size_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printing_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printing_categories (
    category_id integer NOT NULL,
    category_name character varying(150) NOT NULL,
    source_category_name character varying(150),
    item_count integer DEFAULT 0 NOT NULL,
    item_number_range character varying(50),
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: printing_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.printing_categories ALTER COLUMN category_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.printing_categories_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printing_cost_estimates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printing_cost_estimates (
    estimate_id bigint NOT NULL,
    estimate_number character varying(50) NOT NULL,
    job_title character varying(250) NOT NULL,
    product_type character varying(100),
    printing_category_id integer,
    printing_item_id integer,
    material_id integer,
    paper_size_id integer,
    printing_side character varying(50),
    color_mode character varying(50),
    job_description text,
    notes text,
    specifications_snapshot jsonb,
    material_pricing_snapshot jsonb,
    profit_percentage numeric(8,2) DEFAULT 20 NOT NULL,
    fixed_profit_amount numeric(18,2),
    profit_calculation_method character varying(50) DEFAULT 'Percentage'::character varying NOT NULL,
    tax_percentage numeric(8,2) DEFAULT 0 NOT NULL,
    tax_calculation_method character varying(50) DEFAULT 'OnSubtotal'::character varying NOT NULL,
    status character varying(50) DEFAULT 'Draft'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    printing_color_count smallint
);


--
-- Name: printing_cost_estimates_estimate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.printing_cost_estimates ALTER COLUMN estimate_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.printing_cost_estimates_estimate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printing_item_sizes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printing_item_sizes (
    id bigint NOT NULL,
    printing_item_id integer NOT NULL,
    size_id integer NOT NULL,
    is_default boolean DEFAULT false NOT NULL
);


--
-- Name: printing_item_sizes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.printing_item_sizes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.printing_item_sizes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printing_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printing_items (
    item_id integer NOT NULL,
    category_id integer NOT NULL,
    source_item_number integer,
    item_name character varying(250) NOT NULL,
    default_width_mm numeric(10,2),
    default_height_mm numeric(10,2),
    inches_str character varying(50),
    cm_str character varying(50),
    mm_str character varying(50),
    sizing_basis character varying(100),
    source_notes text,
    is_custom boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: printing_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.printing_items ALTER COLUMN item_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.printing_items_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printing_machine_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printing_machine_rates (
    id integer NOT NULL,
    machine_name character varying(100) NOT NULL,
    print_per_plate numeric(18,4) DEFAULT 0 NOT NULL,
    print_per_set numeric(18,4) DEFAULT 0 NOT NULL,
    printing_plate numeric(18,4) DEFAULT 0 NOT NULL,
    plate_per_set numeric(18,4) DEFAULT 0 NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: printing_machine_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.printing_machine_rates ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.printing_machine_rates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printing_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printing_materials (
    material_id integer NOT NULL,
    material_name character varying(150) NOT NULL,
    default_length numeric(10,3),
    default_width numeric(10,3),
    default_gsm numeric(10,3),
    default_rate_per_kg numeric(18,4),
    default_sheets_per_rim integer DEFAULT 500,
    default_conversion_factor numeric(12,4) DEFAULT 3100,
    pricing_method character varying(50),
    packet_price numeric(18,4),
    sheets_per_packet integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: printing_materials_material_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.printing_materials ALTER COLUMN material_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.printing_materials_material_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printing_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printing_order_items (
    order_item_id bigint NOT NULL,
    order_id bigint NOT NULL,
    quotation_item_id bigint,
    product_name character varying(250) NOT NULL,
    description text,
    size_dimensions character varying(150),
    material character varying(150),
    gsm character varying(50),
    printing_color character varying(100),
    finishing character varying(150),
    quantity numeric(18,3) DEFAULT 1 NOT NULL,
    unit character varying(50) DEFAULT 'pcs'::character varying NOT NULL,
    unit_price numeric(18,2) DEFAULT 0 NOT NULL,
    line_total numeric(18,2) DEFAULT 0 NOT NULL,
    production_type character varying(50) DEFAULT 'IN_HOUSE'::character varying NOT NULL,
    notes text
);


--
-- Name: printing_order_items_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.printing_order_items ALTER COLUMN order_item_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.printing_order_items_order_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printing_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printing_orders (
    order_id bigint NOT NULL,
    order_number character varying(50) NOT NULL,
    quotation_id bigint NOT NULL,
    revision_id bigint NOT NULL,
    client_id bigint,
    customer_name character varying(200) NOT NULL,
    contact_person character varying(150),
    customer_phone character varying(30) NOT NULL,
    customer_email character varying(200),
    customer_address text,
    status character varying(50) DEFAULT 'Pending Review'::character varying NOT NULL,
    production_type character varying(50) DEFAULT 'IN_HOUSE'::character varying NOT NULL,
    subtotal numeric(18,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(18,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(18,2) DEFAULT 0 NOT NULL,
    grand_total numeric(18,2) DEFAULT 0 NOT NULL,
    notes text,
    confirmed_at timestamp with time zone,
    confirmed_by character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: printing_orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.printing_orders ALTER COLUMN order_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.printing_orders_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: printing_sizes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printing_sizes (
    size_id integer NOT NULL,
    size_name character varying(100) NOT NULL,
    width_mm numeric(10,2),
    height_mm numeric(10,2),
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: printing_sizes_size_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.printing_sizes ALTER COLUMN size_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.printing_sizes_size_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: production_job_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_job_items (
    id bigint NOT NULL,
    job_id bigint NOT NULL,
    order_item_id bigint NOT NULL
);


--
-- Name: production_job_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.production_job_items ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.production_job_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: production_job_sheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_job_sheets (
    id bigint NOT NULL,
    job_card_number character varying(50) NOT NULL,
    job_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    customer_name character varying(150) NOT NULL,
    job_name character varying(200) NOT NULL,
    quantity integer NOT NULL,
    paper_size character varying(100),
    paper_type character varying(100),
    gsm integer,
    printing_sheet_size character varying(100),
    printing_colors character varying(50),
    printing_side character varying(50),
    printing_method character varying(50),
    printing_method_other character varying(100),
    printing_machine character varying(100),
    printing_operator character varying(100),
    printing_start_date timestamp with time zone,
    printing_completion_date timestamp with time zone,
    lamination character varying(50),
    lamination_other character varying(100),
    die_cutting character varying(50),
    binding character varying(50),
    binding_other character varying(100),
    uv_coating character varying(50),
    packing character varying(50),
    packing_instructions character varying(500),
    special_instructions text,
    production_supervisor character varying(100),
    authorized_by character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: production_job_sheets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.production_job_sheets ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.production_job_sheets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: production_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_jobs (
    job_id bigint NOT NULL,
    job_number character varying(50) NOT NULL,
    order_id bigint NOT NULL,
    production_type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'Queued'::character varying NOT NULL,
    priority character varying(30) DEFAULT 'Normal'::character varying NOT NULL,
    target_start_date timestamp with time zone,
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    assigned_operator character varying(150),
    machine_name character varying(150),
    vendor_name character varying(200),
    vendor_phone character varying(50),
    vendor_email character varying(200),
    vendor_reference character varying(100),
    outsourced_cost numeric(18,2),
    expected_delivery_date timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: production_jobs_job_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.production_jobs ALTER COLUMN job_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.production_jobs_job_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quotation_approval_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation_approval_logs (
    approval_id bigint NOT NULL,
    revision_id bigint NOT NULL,
    decision character varying(30) NOT NULL,
    response_method character varying(30) NOT NULL,
    contact_name character varying(150),
    response_at timestamp with time zone NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: quotation_approval_logs_approval_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quotation_approval_logs ALTER COLUMN approval_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.quotation_approval_logs_approval_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation_items (
    item_id bigint NOT NULL,
    revision_id bigint NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    item_type character varying(30) DEFAULT 'Printing'::character varying NOT NULL,
    product_name character varying(250) NOT NULL,
    description text,
    size_dimensions character varying(150),
    material character varying(150),
    gsm character varying(50),
    printing_color character varying(100),
    finishing character varying(150),
    quantity numeric(18,3) DEFAULT 1.0 NOT NULL,
    unit character varying(50) DEFAULT 'pcs'::character varying NOT NULL,
    unit_price numeric(18,2) NOT NULL,
    line_total numeric(18,2) NOT NULL,
    notes text,
    service_category character varying(50),
    service_details text,
    production_type character varying(50) DEFAULT 'IN_HOUSE'::character varying
);


--
-- Name: quotation_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quotation_items ALTER COLUMN item_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.quotation_items_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quotation_revisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation_revisions (
    revision_id bigint NOT NULL,
    quotation_id bigint NOT NULL,
    revision_number integer NOT NULL,
    status character varying(30) DEFAULT 'Draft'::character varying NOT NULL,
    quotation_date timestamp with time zone NOT NULL,
    valid_until timestamp with time zone NOT NULL,
    subtotal numeric(18,2) NOT NULL,
    discount_type character varying(20) DEFAULT 'None'::character varying NOT NULL,
    discount_value numeric(18,2) DEFAULT 0.0 NOT NULL,
    discount_amount numeric(18,2) DEFAULT 0.0 NOT NULL,
    tax_rate numeric(8,4) DEFAULT 0.0 NOT NULL,
    tax_amount numeric(18,2) DEFAULT 0.0 NOT NULL,
    grand_total numeric(18,2) NOT NULL,
    internal_notes text,
    customer_notes text,
    terms_and_conditions text,
    finalized_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    production_type character varying(50) DEFAULT 'IN_HOUSE'::character varying
);


--
-- Name: quotation_revisions_revision_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quotation_revisions ALTER COLUMN revision_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.quotation_revisions_revision_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quotation_send_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation_send_logs (
    send_id bigint NOT NULL,
    revision_id bigint NOT NULL,
    send_method character varying(30) NOT NULL,
    recipient character varying(200) NOT NULL,
    marked_sent_at timestamp with time zone NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: quotation_send_logs_send_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quotation_send_logs ALTER COLUMN send_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.quotation_send_logs_send_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotations (
    quotation_id bigint NOT NULL,
    quotation_number character varying(50) NOT NULL,
    client_id bigint,
    customer_name character varying(200) NOT NULL,
    contact_person character varying(150),
    customer_phone character varying(30) NOT NULL,
    customer_email character varying(200),
    customer_address text,
    quotation_type character varying(30) DEFAULT 'Printing'::character varying NOT NULL,
    currency character varying(3) DEFAULT 'PKR'::character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: quotations_quotation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quotations ALTER COLUMN quotation_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.quotations_quotation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."__EFMigrationsHistory" VALUES ('20261030054906_InitialClientsSchema', '8.0.33');
INSERT INTO public."__EFMigrationsHistory" VALUES ('20261030100645_AddQuotationModuleSchema', '8.0.33');


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.admin_users OVERRIDING SYSTEM VALUE VALUES (1, 'admin@zeropixel.com', '$2a$11$ZFk4L4uHbG9P4vaYWwWFzOy2szVKkhOA11c4BfPdbSI9Tpl8TNQOe', 'Naveed', 'Admin', '2026-10-30 10:50:12.571607+05', '2026-11-05 10:30:51.542747+05');


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.clients OVERRIDING SYSTEM VALUE VALUES (10, 'NISHAT (CHUNIAN) LIMITED', 'ADEEL RAZZAQ', '92 42 5761730-9', 'adeelrazzaq@nishat.net', '31 Q, Gulberg II, Lahore Pakistan', true, '2026-11-11 14:36:05.645176+05', '2026-11-11 14:36:05.645203+05', NULL);
INSERT INTO public.clients OVERRIDING SYSTEM VALUE VALUES (9, 'Systems', 'Umair', '03134565030', 'ranaumairofficial2@gmail.com', 'Near Lahore', true, '2026-11-02 17:41:17.362648+05', '2026-11-11 14:41:23.229265+05', '2026-11-11 14:41:23.229263+05');
INSERT INTO public.clients OVERRIDING SYSTEM VALUE VALUES (11, 'ZeroPixel', 'Naveed Ahmad', '0321 8401998', 'zeropixel@gmail.pk', 'Lahore Pakistan', true, '2026-11-12 10:09:16.136167+05', '2026-11-12 10:09:16.13633+05', NULL);


--
-- Data for Name: cost_categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (1, 'Paper / Art Card', 1, 'PerSheet', NULL, true, '2026-11-04 11:17:47.04737+05');
INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (2, 'Positive / Tracing', 2, 'FixedAmount', NULL, true, '2026-11-04 11:17:47.047509+05');
INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (3, 'Plates', 3, 'FixedAmount', 900.0000, true, '2026-11-04 11:17:47.047509+05');
INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (4, 'Printing', 4, 'FixedAmount', 1000.0000, true, '2026-11-04 11:17:47.047544+05');
INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (5, 'Lamination', 5, 'ManualAmount', NULL, true, '2026-11-04 11:17:47.047544+05');
INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (6, 'Die Making', 6, 'FixedAmount', NULL, true, '2026-11-04 11:17:47.047545+05');
INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (7, 'Die Cutting', 7, 'ManualAmount', NULL, true, '2026-11-04 11:17:47.047545+05');
INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (8, 'Binding', 8, 'ManualAmount', NULL, true, '2026-11-04 11:17:47.047545+05');
INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (9, 'Packing', 9, 'ManualAmount', NULL, true, '2026-11-04 11:17:47.047546+05');
INSERT INTO public.cost_categories OVERRIDING SYSTEM VALUE VALUES (10, 'Petrol + Misc.', 10, 'ManualAmount', NULL, true, '2026-11-04 11:17:47.047546+05');


--
-- Data for Name: estimate_cost_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (1, 1, 2, 'Positive / Tracing', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 1);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (2, 1, 3, 'Plates', 'FixedAmount', 900.0000, 1.000, 900.0000, '', 2);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (3, 1, 4, 'Printing', 'FixedAmount', 1000.0000, 1.000, 1000.0000, '', 3);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (4, 1, 5, 'Lamination', 'ManualAmount', 0.0000, 1.000, 300.0000, '', 4);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (5, 1, 6, 'Die Making', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 5);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (6, 1, 7, 'Die Cutting', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 6);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (7, 1, 8, 'Binding', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 7);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (8, 1, 9, 'Packing', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 8);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (9, 1, 10, 'Petrol + Misc.', 'ManualAmount', 300.0000, 1.000, 300.0000, '', 9);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (10, 2, 2, 'Positive / Tracing', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 1);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (11, 2, 3, 'Plates', 'FixedAmount', 900.0000, 1.000, 900.0000, '', 2);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (12, 2, 4, 'Printing', 'FixedAmount', 1000.0000, 1.000, 1000.0000, '', 3);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (13, 2, 5, 'Lamination', 'ManualAmount', 0.0000, 1.000, 300.0000, '', 4);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (14, 2, 6, 'Die Making', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 5);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (15, 2, 7, 'Die Cutting', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 6);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (16, 2, 8, 'Binding', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 7);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (17, 2, 9, 'Packing', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 8);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (18, 2, 10, 'Petrol + Misc.', 'ManualAmount', 300.0000, 1.000, 300.0000, '', 9);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (19, 3, 2, 'Positive / Tracing', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 1);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (20, 3, 3, 'Plates', 'FixedAmount', 900.0000, 1.000, 900.0000, '', 2);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (21, 3, 4, 'Printing', 'FixedAmount', 1000.0000, 1.000, 1000.0000, '', 3);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (22, 3, 5, 'Lamination', 'ManualAmount', 0.0000, 1.000, 400.0000, '', 4);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (23, 3, 6, 'Die Making', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 5);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (24, 3, 7, 'Die Cutting', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 6);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (25, 3, 8, 'Binding', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 7);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (26, 3, 9, 'Packing', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 8);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (27, 3, 10, 'Petrol + Misc.', 'ManualAmount', 300.0000, 1.000, 300.0000, '', 9);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (28, 4, 2, 'Positive / Tracing', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 1);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (29, 4, 3, 'Plates', 'FixedAmount', 900.0000, 1.000, 900.0000, '', 2);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (30, 4, 4, 'Printing', 'FixedAmount', 1000.0000, 1.000, 1000.0000, '', 3);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (31, 4, 5, 'Lamination', 'ManualAmount', 0.0000, 1.000, 700.0000, '', 4);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (32, 4, 6, 'Die Making', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 5);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (33, 4, 7, 'Die Cutting', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 6);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (34, 4, 8, 'Binding', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 7);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (35, 4, 9, 'Packing', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 8);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (36, 4, 10, 'Petrol + Misc.', 'ManualAmount', 300.0000, 1.000, 300.0000, '', 9);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (37, 5, 2, 'Positive / Tracing', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 1);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (38, 5, 3, 'Plates', 'FixedAmount', 900.0000, 1.000, 900.0000, '', 2);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (39, 5, 4, 'Printing', 'FixedAmount', 1000.0000, 1.000, 1000.0000, '', 3);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (40, 5, 5, 'Lamination', 'ManualAmount', 0.0000, 1.000, 300.0000, '', 4);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (41, 5, 6, 'Die Making', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 5);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (42, 5, 7, 'Die Cutting', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 6);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (43, 5, 8, 'Binding', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 7);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (44, 5, 9, 'Packing', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 8);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (45, 5, 10, 'Petrol + Misc.', 'ManualAmount', 300.0000, 1.000, 300.0000, '', 9);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (46, 6, 2, 'Positive / Tracing', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 1);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (47, 6, 3, 'Plates', 'FixedAmount', 900.0000, 1.000, 900.0000, '', 2);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (48, 6, 4, 'Printing', 'FixedAmount', 1000.0000, 1.000, 1000.0000, '', 3);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (49, 6, 5, 'Lamination', 'ManualAmount', 0.0000, 1.000, 300.0000, '', 4);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (50, 6, 6, 'Die Making', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 5);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (51, 6, 7, 'Die Cutting', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 6);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (52, 6, 8, 'Binding', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 7);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (53, 6, 9, 'Packing', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 8);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (54, 6, 10, 'Petrol + Misc.', 'ManualAmount', 300.0000, 1.000, 300.0000, '', 9);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (55, 7, 2, 'Positive / Tracing', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 1);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (56, 7, 3, 'Plates', 'FixedAmount', 900.0000, 1.000, 900.0000, '', 2);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (57, 7, 4, 'Printing', 'FixedAmount', 1000.0000, 1.000, 1000.0000, '', 3);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (58, 7, 5, 'Lamination', 'ManualAmount', 0.0000, 1.000, 400.0000, '', 4);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (59, 7, 6, 'Die Making', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 5);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (60, 7, 7, 'Die Cutting', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 6);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (61, 7, 8, 'Binding', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 7);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (62, 7, 9, 'Packing', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 8);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (63, 7, 10, 'Petrol + Misc.', 'ManualAmount', 300.0000, 1.000, 300.0000, '', 9);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (64, 8, 2, 'Positive / Tracing', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 1);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (65, 8, 3, 'Plates', 'FixedAmount', 900.0000, 1.000, 900.0000, '', 2);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (66, 8, 4, 'Printing', 'FixedAmount', 1000.0000, 1.000, 1000.0000, '', 3);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (67, 8, 5, 'Lamination', 'ManualAmount', 0.0000, 1.000, 700.0000, '', 4);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (68, 8, 6, 'Die Making', 'FixedAmount', 0.0000, 1.000, 0.0000, '', 5);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (69, 8, 7, 'Die Cutting', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 6);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (70, 8, 8, 'Binding', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 7);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (71, 8, 9, 'Packing', 'ManualAmount', 0.0000, 1.000, 0.0000, '', 8);
INSERT INTO public.estimate_cost_items OVERRIDING SYSTEM VALUE VALUES (72, 8, 10, 'Petrol + Misc.', 'ManualAmount', 300.0000, 1.000, 300.0000, '', 9);


--
-- Data for Name: estimate_quantities; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.estimate_quantities OVERRIDING SYSTEM VALUE VALUES (1, 1, 100, 2.00, 0.00, 162.0000, 1);
INSERT INTO public.estimate_quantities OVERRIDING SYSTEM VALUE VALUES (2, 1, 250, 5.00, 0.00, 405.0000, 2);
INSERT INTO public.estimate_quantities OVERRIDING SYSTEM VALUE VALUES (3, 1, 500, 7.00, 0.00, 567.0000, 3);
INSERT INTO public.estimate_quantities OVERRIDING SYSTEM VALUE VALUES (4, 1, 1000, 15.00, 0.00, 1215.0000, 4);
INSERT INTO public.estimate_quantities OVERRIDING SYSTEM VALUE VALUES (5, 2, 100, 2.00, 0.00, 162.0000, 1);
INSERT INTO public.estimate_quantities OVERRIDING SYSTEM VALUE VALUES (6, 2, 250, 5.00, 0.00, 405.0000, 2);
INSERT INTO public.estimate_quantities OVERRIDING SYSTEM VALUE VALUES (7, 2, 500, 7.00, 0.00, 567.0000, 3);
INSERT INTO public.estimate_quantities OVERRIDING SYSTEM VALUE VALUES (8, 2, 1000, 15.00, 0.00, 1215.0000, 4);


--
-- Data for Name: estimate_results; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.estimate_results OVERRIDING SYSTEM VALUE VALUES (1, 1, 162.0000, 2500.0000, 2662.0000, 532.4000, 3194.4000, 0.0000, 3194.4000, 31.9400, '2026-11-05 10:35:44.044067+05');
INSERT INTO public.estimate_results OVERRIDING SYSTEM VALUE VALUES (2, 2, 405.0000, 2500.0000, 2905.0000, 581.0000, 3486.0000, 0.0000, 3486.0000, 13.9400, '2026-11-05 10:35:44.044337+05');
INSERT INTO public.estimate_results OVERRIDING SYSTEM VALUE VALUES (3, 3, 567.0000, 2600.0000, 3167.0000, 633.4000, 3800.4000, 0.0000, 3800.4000, 7.6000, '2026-11-05 10:35:44.04434+05');
INSERT INTO public.estimate_results OVERRIDING SYSTEM VALUE VALUES (4, 4, 1215.0000, 2900.0000, 4115.0000, 823.0000, 4938.0000, 0.0000, 4938.0000, 4.9400, '2026-11-05 10:35:44.044353+05');
INSERT INTO public.estimate_results OVERRIDING SYSTEM VALUE VALUES (5, 5, 162.0000, 2500.0000, 2662.0000, 532.4000, 3194.4000, 0.0000, 3194.4000, 31.9400, '2026-11-05 10:37:20.413943+05');
INSERT INTO public.estimate_results OVERRIDING SYSTEM VALUE VALUES (6, 6, 405.0000, 2500.0000, 2905.0000, 581.0000, 3486.0000, 0.0000, 3486.0000, 13.9400, '2026-11-05 10:37:20.413958+05');
INSERT INTO public.estimate_results OVERRIDING SYSTEM VALUE VALUES (7, 7, 567.0000, 2600.0000, 3167.0000, 633.4000, 3800.4000, 0.0000, 3800.4000, 7.6000, '2026-11-05 10:37:20.413961+05');
INSERT INTO public.estimate_results OVERRIDING SYSTEM VALUE VALUES (8, 8, 1215.0000, 2900.0000, 4115.0000, 823.0000, 4938.0000, 0.0000, 4938.0000, 4.9400, '2026-11-05 10:37:20.413967+05');


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.invoice_items OVERRIDING SYSTEM VALUE VALUES (15, 8, 1, NULL, 'books', 100.00, 9.91, 991.00, '2026-11-12 10:10:17.685086+05');
INSERT INTO public.invoice_items OVERRIDING SYSTEM VALUE VALUES (16, 8, 2, NULL, 'letters', 100.00, 109.92, 10992.00, '2026-11-12 10:10:17.685128+05');


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.invoices OVERRIDING SYSTEM VALUE VALUES (8, 'INV-202611-0001', '2026-11-12 05:00:00+05', 11, 'ZeroPixel', 'ZeroPixel', '0321 8401998', 'zeropixel@gmail.pk', 'Lahore Pakistan', 11983.00, 200.00, 11783.00, NULL, '2026-11-12 10:10:17.689165+05', '2026-11-12 10:10:17.689227+05', '0313', NULL);


--
-- Data for Name: paper_sizes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (1, '23 × 36', 23.000, 36.000, 584.20, 914.40, 'StockPaper', true, '2026-11-04 11:17:46.840406+05', '2026-11-04 11:17:46.840406+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (2, '25 × 36', 25.000, 36.000, 635.00, 914.40, 'StockPaper', true, '2026-11-04 11:17:46.84064+05', '2026-11-04 11:17:46.84064+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (3, 'A4', 8.270, 11.679, 210.00, 297.00, 'StockPaper', true, '2026-11-04 11:17:46.840641+05', '2026-11-04 11:17:46.840641+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (4, 'A5', 5.700, 8.270, 148.00, 210.00, 'StockPaper', true, '2026-11-04 11:17:46.840641+05', '2026-11-04 11:17:46.840641+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (5, 'Letter', 8.500, 11.000, 215.90, 279.40, 'StockPaper', true, '2026-11-04 11:17:46.840641+05', '2026-11-04 11:17:46.840641+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (6, 'Legal', 8.500, 14.000, 215.90, 355.60, 'StockPaper', true, '2026-11-04 11:17:46.840645+05', '2026-11-04 11:17:46.840645+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (7, '7 × 9', 7.000, 9.000, 177.80, 228.60, 'StockPaper', true, '2026-11-04 11:17:46.840645+05', '2026-11-04 11:17:46.840645+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (8, 'A6', 4.130, 5.830, 105.00, 148.00, 'SizeGuide', true, '2026-11-04 11:17:46.840646+05', '2026-11-04 11:17:46.840646+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (9, 'A3', 11.690, 16.540, 297.00, 420.00, 'SizeGuide', true, '2026-11-04 11:17:46.840646+05', '2026-11-04 11:17:46.840646+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (10, 'A2', 16.540, 23.390, 420.00, 594.00, 'SizeGuide', true, '2026-11-04 11:17:46.840646+05', '2026-11-04 11:17:46.840646+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (11, 'A1', 23.390, 33.110, 594.00, 841.00, 'SizeGuide', true, '2026-11-04 11:17:46.840648+05', '2026-11-04 11:17:46.840648+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (12, 'DL finished', 3.900, 8.270, 99.00, 210.00, 'SizeGuide', true, '2026-11-04 11:17:46.840649+05', '2026-11-04 11:17:46.840649+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (13, 'C5 envelope', 9.020, 6.380, 229.00, 162.00, 'SizeGuide', true, '2026-11-04 11:17:46.840649+05', '2026-11-04 11:17:46.840649+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (14, 'C4 envelope', 12.760, 9.020, 324.00, 229.00, 'SizeGuide', true, '2026-11-04 11:17:46.840649+05', '2026-11-04 11:17:46.840649+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (15, 'CR80 ID card', 3.370, 2.130, 85.60, 54.00, 'SizeGuide', true, '2026-11-04 11:17:46.840649+05', '2026-11-04 11:17:46.84065+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (16, 'Common 3×6 ft banner', 36.000, 72.000, 914.40, 1828.80, 'SizeGuide', true, '2026-11-04 11:17:46.840652+05', '2026-11-04 11:17:46.840652+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (17, 'Common 8×4 ft board', 96.000, 48.000, 2438.40, 1219.20, 'SizeGuide', true, '2026-11-04 11:17:46.840652+05', '2026-11-04 11:17:46.840652+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (18, 'Common roll-up', 33.460, 78.740, 850.00, 2000.00, 'SizeGuide', true, '2026-11-04 11:17:46.840653+05', '2026-11-04 11:17:46.840653+05');
INSERT INTO public.paper_sizes OVERRIDING SYSTEM VALUE VALUES (19, 'Custom Size', NULL, NULL, NULL, NULL, 'StockPaper', true, '2026-11-04 11:17:46.840653+05', '2026-11-04 11:17:46.840653+05');


--
-- Data for Name: printing_categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (1, 'Flyers, Leaflets & Brochures', 'Flyers, Leaflets & Brochures', 18, '1–18', 1, true, '2026-11-04 11:17:46.446332+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (2, 'Corporate Stationery', 'Corporate Stationery', 20, '19–38', 2, true, '2026-11-04 11:17:46.522462+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (3, 'Catalogues, Profiles & Publications', 'Catalogues, Profiles & Publications', 16, '39–54', 3, true, '2026-11-04 11:17:46.523224+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (4, 'Marketing & POS Materials', 'Marketing & POS Materials', 20, '55–74', 4, true, '2026-11-04 11:17:46.523268+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (5, 'Packaging & Label Printing', 'Packaging & Label Printing', 21, '75–95', 5, true, '2026-11-04 11:17:46.523293+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (6, 'Office Forms & Record Books', 'Office Forms & Record Books', 16, '96–111', 6, true, '2026-11-04 11:17:46.523313+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (7, 'Large Format & Outdoor Printing', 'Large Format & Outdoor Printing', 14, '112–125', 7, true, '2026-11-04 11:17:46.523332+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (8, 'Corporate Gifts, Diaries & Calendars', 'Corporate Gifts, Diaries & Calendars', 14, '126–139', 8, true, '2026-11-04 11:17:46.523364+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (9, 'Event & Exhibition Printing', 'Event & Exhibition Printing', 14, '140–153', 9, true, '2026-11-04 11:17:46.523388+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (10, 'Restaurant & Food Business Printing', 'Restaurant & Food Business Printing', 13, '154–166', 10, true, '2026-11-04 11:17:46.52341+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (11, 'Pharmaceutical & Healthcare Printing', 'Pharmaceutical & Healthcare Printing', 13, '167–179', 11, true, '2026-11-04 11:17:46.523429+05');
INSERT INTO public.printing_categories OVERRIDING SYSTEM VALUE VALUES (12, 'Education, Real Estate & Industrial Printing', 'Education, Real Estate & Industrial Printing', 16, '180–195', 12, true, '2026-11-04 11:17:46.523446+05');


--
-- Data for Name: printing_cost_estimates; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.printing_cost_estimates OVERRIDING SYSTEM VALUE VALUES (1, 'EST-20261105-6943', 'New Printing Job Estimate', 'Flyer', 1, 4, 1, 2, 'Front Side', '4 Color', 'Standard Printing Job', 'Excel Reference Notes: A5; print 2 sides', '{"widthMm": "297", "heightMm": "420", "jobTitle": "Standard Printing Job", "finishedUnit": "in", "ratePerColor": "0", "finishedWidth": "11.69", "customItemName": "", "finishedHeight": "16.54", "printingSizeId": "4", "stockPaperUnit": "in", "measurementUnit": "MM", "stockPaperWidth": "36", "printingSizeName": "A3", "stockPaperLength": "25", "customMaterialName": "", "printingColorCount": "0", "materialVariantName": "ART CARD 300 GSM (25×36)", "finishingRequirements": "Matt Lamination"}', '{"gsm": "300", "rimPrice": "0", "ratePerKg": "680", "packetPrice": "8100", "sheetsPerRim": "500", "pricingMethod": "PacketPrice", "sheetsPerPacket": "100", "conversionFactor": "3100", "directSheetPrice": "0", "manualMaterialCost": "0", "computedPerSheetPrice": "81"}', 20.00, NULL, 'Percentage', 0.00, 'OnSubtotal', 'Draft', '2026-11-05 10:35:43.904874+05', '2026-11-05 10:35:44.038223+05', NULL, NULL);
INSERT INTO public.printing_cost_estimates OVERRIDING SYSTEM VALUE VALUES (2, 'EST-20261105-4973', 'Standard Business Card Estimate', 'Flyers, Leaflets & Brochures', 1, 1, 1, 2, 'Front Side', '4 Color', 'Mono Flyer (Single Colour)', 'Excel Reference Notes: A5; mono describes ink colour, not size', '{"widthMm": "148", "heightMm": "210", "jobTitle": "Mono Flyer (Single Colour)", "finishedUnit": "in", "ratePerColor": "0", "finishedWidth": "5.83", "customItemName": "", "finishedHeight": "8.27", "printingSizeId": "2", "stockPaperUnit": "in", "measurementUnit": "MM", "stockPaperWidth": "36", "printingSizeName": "A5", "stockPaperLength": "25", "customMaterialName": "", "printingColorCount": "0", "materialVariantName": "ART CARD 300 GSM (25×36)", "finishingRequirements": "Matt Lamination"}', '{"gsm": "300", "rimPrice": "0", "ratePerKg": "680", "packetPrice": "8100", "sheetsPerRim": "500", "pricingMethod": "PacketPrice", "sheetsPerPacket": "100", "conversionFactor": "3100", "directSheetPrice": "0", "manualMaterialCost": "0", "computedPerSheetPrice": "81"}', 20.00, NULL, 'Percentage', 0.00, 'OnSubtotal', 'Draft', '2026-11-05 10:37:20.412554+05', '2026-11-05 10:37:20.413788+05', NULL, NULL);


--
-- Data for Name: printing_item_sizes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (1, 1, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (2, 2, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (3, 3, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (4, 4, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (5, 5, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (6, 6, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (7, 7, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (8, 8, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (9, 9, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (10, 10, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (11, 11, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (12, 12, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (13, 13, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (14, 14, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (15, 15, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (16, 16, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (17, 17, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (18, 18, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (19, 19, 15, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (20, 20, 15, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (21, 21, 15, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (22, 22, 15, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (23, 23, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (24, 24, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (25, 25, 16, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (26, 26, 9, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (27, 27, 8, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (28, 28, 17, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (29, 29, 18, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (30, 30, 18, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (31, 31, 18, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (32, 32, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (33, 33, 1, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (34, 34, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (35, 35, 19, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (36, 36, 10, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (37, 37, 15, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (38, 38, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (39, 39, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (40, 40, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (41, 41, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (42, 42, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (43, 43, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (44, 44, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (45, 45, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (46, 46, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (47, 47, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (48, 48, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (49, 49, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (50, 50, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (51, 51, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (52, 52, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (53, 53, 20, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (54, 54, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (55, 55, 5, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (56, 56, 6, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (57, 57, 21, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (58, 58, 22, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (59, 59, 23, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (60, 60, 24, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (61, 61, 25, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (62, 62, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (63, 63, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (64, 64, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (65, 65, 23, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (66, 66, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (67, 67, 22, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (68, 68, 26, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (69, 69, 20, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (70, 70, 27, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (71, 71, 28, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (72, 72, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (73, 73, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (74, 74, 10, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (75, 75, 24, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (76, 76, 21, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (77, 77, 29, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (78, 78, 21, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (79, 79, 30, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (80, 80, 30, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (81, 81, 31, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (82, 82, 32, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (83, 83, 28, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (84, 84, 31, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (85, 85, 33, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (86, 86, 22, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (87, 87, 34, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (88, 88, 35, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (89, 89, 36, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (90, 90, 37, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (91, 91, 15, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (92, 92, 28, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (93, 93, 38, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (94, 94, 38, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (95, 95, 39, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (96, 96, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (97, 97, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (98, 98, 1, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (99, 99, 1, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (100, 100, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (101, 101, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (102, 102, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (103, 103, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (104, 104, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (105, 105, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (106, 106, 1, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (107, 107, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (108, 108, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (109, 109, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (110, 110, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (111, 111, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (112, 112, 11, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (113, 113, 11, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (114, 114, 13, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (115, 115, 40, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (116, 116, 41, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (117, 117, 12, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (118, 118, 42, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (119, 119, 43, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (120, 120, 44, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (121, 121, 44, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (122, 122, 45, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (123, 123, 44, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (124, 124, 46, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (125, 125, 11, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (126, 126, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (127, 127, 47, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (128, 128, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (129, 129, 4, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (130, 130, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (131, 131, 10, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (132, 132, 1, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (133, 133, 1, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (134, 134, 1, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (135, 135, 48, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (136, 136, 49, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (137, 137, 24, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (138, 138, 38, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (139, 139, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (140, 140, 50, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (141, 141, 21, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (142, 142, 51, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (143, 143, 52, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (144, 144, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (145, 145, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (146, 146, 18, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (147, 147, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (148, 148, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (149, 149, 1, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (150, 150, 53, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (151, 151, 42, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (152, 152, 43, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (153, 153, 54, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (154, 154, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (155, 155, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (156, 156, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (157, 157, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (158, 158, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (159, 159, 7, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (160, 160, 20, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (161, 161, 55, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (162, 162, 38, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (163, 163, 20, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (164, 164, 56, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (165, 165, 57, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (166, 166, 58, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (167, 167, 30, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (168, 168, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (169, 169, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (170, 170, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (171, 171, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (172, 172, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (173, 173, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (174, 174, 18, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (175, 175, 9, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (176, 176, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (177, 177, 5, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (178, 178, 18, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (179, 179, 59, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (180, 180, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (181, 181, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (182, 182, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (183, 183, 10, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (184, 184, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (185, 185, 2, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (186, 186, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (187, 187, 18, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (188, 188, 4, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (189, 189, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (190, 190, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (191, 191, 3, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (192, 192, 5, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (193, 193, 54, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (194, 194, 10, true);
INSERT INTO public.printing_item_sizes OVERRIDING SYSTEM VALUE VALUES (195, 195, 2, true);


--
-- Data for Name: printing_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (1, 1, 1, 'Mono Flyer (Single Colour)', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5; mono describes ink colour, not size', false, true, '2026-11-04 11:17:46.692222+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (2, 1, 2, 'Full Colour Flyer', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4; A5 also common', false, true, '2026-11-04 11:17:46.740261+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (3, 1, 3, 'Single-Sided Flyer', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5; print 1 side', false, true, '2026-11-04 11:17:46.740444+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (4, 1, 4, 'Double-Sided Flyer', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5; print 2 sides', false, true, '2026-11-04 11:17:46.74051+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (5, 1, 5, 'Bi-Fold Flyer', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5 folded size; flat A4 297 × 210 mm', false, true, '2026-11-04 11:17:46.740556+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (6, 1, 6, 'Tri-Fold Flyer', 99.00, 210.00, '3.90 × 8.27', '9.9 × 21', '99 × 210', 'Common size', 'DL finished size; flat A4 297 × 210 mm', false, true, '2026-11-04 11:17:46.740604+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (7, 1, 7, 'Z-Fold Leaflet', 99.00, 210.00, '3.90 × 8.27', '9.9 × 21', '99 × 210', 'Common size', 'DL finished; flat A4 297 × 210 mm', false, true, '2026-11-04 11:17:46.740652+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (8, 1, 8, 'Gate-Fold Brochure', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Suggested size', 'A4 closed; open sheet/die-line depends on gate panels', false, true, '2026-11-04 11:17:46.740692+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (9, 1, 9, 'Accordion-Fold Brochure', 99.00, 210.00, '3.90 × 8.27', '9.9 × 21', '99 × 210', 'Common size', 'DL finished; flat size depends on panel count', false, true, '2026-11-04 11:17:46.740731+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (10, 1, 10, 'Single-Sheet Leaflet', 99.00, 210.00, '3.90 × 8.27', '9.9 × 21', '99 × 210', 'Common size', 'DL; A5/A4 also common', false, true, '2026-11-04 11:17:46.740776+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (11, 1, 11, 'Bi-Fold Brochure', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5 closed; A4 open 297 × 210 mm', false, true, '2026-11-04 11:17:46.740815+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (12, 1, 12, 'Tri-Fold Brochure', 99.00, 210.00, '3.90 × 8.27', '9.9 × 21', '99 × 210', 'Common size', 'DL closed; A4 open 297 × 210 mm', false, true, '2026-11-04 11:17:46.740852+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (13, 1, 13, 'Multi-Page Brochure', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4 finished; page count/binding separate', false, true, '2026-11-04 11:17:46.74089+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (14, 1, 14, 'Product Catalogue', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4 finished; A5/square also common', false, true, '2026-11-04 11:17:46.740959+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (15, 1, 15, 'Product Specification Sheet', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.74101+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (16, 1, 16, 'Product Insert / Instruction Leaflet', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5 flat; small pharma inserts vary', false, true, '2026-11-04 11:17:46.741059+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (17, 1, 17, 'Promotional Pamphlet', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5', false, true, '2026-11-04 11:17:46.741102+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (18, 1, 18, 'Price List / Rate List', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4; DL also common', false, true, '2026-11-04 11:17:46.741143+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (19, 2, 19, 'Standard Business Card / Visiting Card', 89.00, 51.00, '3.50 × 2.01', '8.9 × 5.1', '89 × 51', 'Common size', 'Approx. 3.5 × 2 inches; 90 × 50 mm also common', false, true, '2026-11-04 11:17:46.741192+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (20, 2, 20, 'Premium Business Card', 89.00, 51.00, '3.50 × 2.01', '8.9 × 5.1', '89 × 51', 'Common size', 'Premium stock/finishing; 90 × 50 mm alternative', false, true, '2026-11-04 11:17:46.741231+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (21, 2, 21, 'Spot UV Business Card', 89.00, 51.00, '3.50 × 2.01', '8.9 × 5.1', '89 × 51', 'Common size', 'UV area customized', false, true, '2026-11-04 11:17:46.741274+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (22, 2, 22, 'Foil Business Card', 89.00, 51.00, '3.50 × 2.01', '8.9 × 5.1', '89 × 51', 'Common size', 'Foil area customized', false, true, '2026-11-04 11:17:46.741314+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (23, 2, 23, 'Letterhead', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.741363+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (24, 2, 24, 'Continuation Sheet', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.741407+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (25, 2, 25, 'DL Envelope', 220.00, 110.00, '8.66 × 4.33', '22 × 11', '220 × 110', 'Common size', 'DL envelope; fits tri-folded A4', false, true, '2026-11-04 11:17:46.741453+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (26, 2, 26, 'A4 Envelope', 324.00, 229.00, '12.76 × 9.02', '32.4 × 22.9', '324 × 229', 'Common size', 'C4 envelope fits A4 unfolded', false, true, '2026-11-04 11:17:46.741491+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (27, 2, 27, 'A5 Envelope', 229.00, 162.00, '9.02 × 6.38', '22.9 × 16.2', '229 × 162', 'Common size', 'C5 envelope fits A5 / folded A4', false, true, '2026-11-04 11:17:46.741529+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (28, 2, 28, 'Document Envelope', 330.00, 254.00, '12.99 × 10.00', '33 × 25.4', '330 × 254', 'Common size', 'Approximate document envelope; tailor to contents', false, true, '2026-11-04 11:17:46.741575+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (29, 2, 29, 'Corporate Presentation Folder', 230.00, 310.00, '9.06 × 12.20', '23 × 31', '230 × 310', 'Common size', 'Closed folder approx.; pockets/die-line custom', false, true, '2026-11-04 11:17:46.741615+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (30, 2, 30, 'Pocket Folder', 230.00, 310.00, '9.06 × 12.20', '23 × 31', '230 × 310', 'Common size', 'Closed folder approx.; internal pockets vary', false, true, '2026-11-04 11:17:46.741653+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (31, 2, 31, 'File Cover', 230.00, 310.00, '9.06 × 12.20', '23 × 31', '230 × 310', 'Common size', 'Closed approx.; A4 document fit', false, true, '2026-11-04 11:17:46.741705+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (32, 2, 32, 'Writing Pad / Notepad', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5 pad; 210 × 297 mm also common', false, true, '2026-11-04 11:17:46.741752+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (33, 2, 33, 'Memo Pad', 105.00, 148.00, '4.13 × 5.83', '10.5 × 14.8', '105 × 148', 'Common size', 'A6', false, true, '2026-11-04 11:17:46.74179+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (34, 2, 34, 'Compliment Slip', 210.00, 99.00, '8.27 × 3.90', '21 × 9.9', '210 × 99', 'Common size', 'DL', false, true, '2026-11-04 11:17:46.741828+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (35, 2, 35, 'Corporate Stamp', 60.00, 25.00, '2.36 × 0.98', '6 × 2.5', '60 × 25', 'Suggested size', 'Stamp impression area only; casing varies', false, true, '2026-11-04 11:17:46.741871+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (36, 2, 36, 'Employee ID Card', 85.60, 54.00, '3.37 × 2.13', '8.56 × 5.4', '85.6 × 54', 'Common size', 'CR80 plastic ID card', false, true, '2026-11-04 11:17:46.741912+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (37, 2, 37, 'Employee Visiting Card', 89.00, 51.00, '3.50 × 2.01', '8.9 × 5.1', '89 × 51', 'Common size', 'Visiting card', false, true, '2026-11-04 11:17:46.741951+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (38, 2, 38, 'Office Register', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4 register; binding/custom page count', false, true, '2026-11-04 11:17:46.741993+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (39, 3, 39, 'Company Profile', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.742038+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (40, 3, 40, 'Product Catalogue', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.742088+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (41, 3, 41, 'Corporate Brochure', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.742126+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (42, 3, 42, 'Annual Report', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.742163+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (43, 3, 43, 'Sustainability / CSR Report', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.742208+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (44, 3, 44, 'Corporate Magazine', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.742247+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (45, 3, 45, 'Newsletter', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.74229+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (46, 3, 46, 'Product Booklet', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5 finished', false, true, '2026-11-04 11:17:46.742328+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (47, 3, 47, 'Training Manual', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.742374+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (48, 3, 48, 'Instruction Manual', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5 finished', false, true, '2026-11-04 11:17:46.742432+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (49, 3, 49, 'User Guide', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', '', false, true, '2026-11-04 11:17:46.742519+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (50, 3, 50, 'Employee Handbook', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', '', false, true, '2026-11-04 11:17:46.742598+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (51, 3, 51, 'Corporate Policy Book', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.742646+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (52, 3, 52, 'Prospectus', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.742695+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (53, 3, 53, 'Coffee Table Book', 300.00, 300.00, '11.81 × 11.81', '30 × 30', '300 × 300', 'Suggested size', 'Square premium book; custom formats common', false, true, '2026-11-04 11:17:46.742735+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (54, 3, 54, 'Technical Specification Book', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.74278+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (55, 4, 55, 'Promotional Poster', 420.00, 594.00, '16.54 × 23.39', '42 × 59.4', '420 × 594', 'Common size', 'A2', false, true, '2026-11-04 11:17:46.74282+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (56, 4, 56, 'Advertising Poster', 594.00, 841.00, '23.39 × 33.11', '59.4 × 84.1', '594 × 841', 'Common size', 'A1', false, true, '2026-11-04 11:17:46.742859+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (57, 4, 57, 'Shelf Talker', 150.00, 100.00, '5.91 × 3.94', '15 × 10', '150 × 100', 'Suggested size', 'Retail shelf size varies', false, true, '2026-11-04 11:17:46.742907+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (58, 4, 58, 'Shelf Wobbler', 100.00, 100.00, '3.94 × 3.94', '10 × 10', '100 × 100', 'Suggested size', 'Die-cut artwork; stem extra', false, true, '2026-11-04 11:17:46.742947+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (59, 4, 59, 'Danglers', 300.00, 450.00, '11.81 × 17.72', '30 × 45', '300 × 450', 'Suggested size', 'Custom die-cut often', false, true, '2026-11-04 11:17:46.743003+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (60, 4, 60, 'Bunting', 150.00, 200.00, '5.91 × 7.87', '15 × 20', '150 × 200', 'Suggested size', 'One flag/section; string length separate', false, true, '2026-11-04 11:17:46.743044+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (61, 4, 61, 'Streamers', 100.00, 600.00, '3.94 × 23.62', '10 × 60', '100 × 600', 'Suggested size', 'Vertical streamer strip', false, true, '2026-11-04 11:17:46.743089+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (62, 4, 62, 'Counter Display Card', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Suggested size', 'A4 counter card', false, true, '2026-11-04 11:17:46.743128+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (63, 4, 63, 'Table Tent Card', 100.00, 210.00, '3.94 × 8.27', '10 × 21', '100 × 210', 'Suggested size', 'Folded/standing face; artwork flat size varies', false, true, '2026-11-04 11:17:46.743168+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (64, 4, 64, 'Tent Calendar', 210.00, 100.00, '8.27 × 3.94', '21 × 10', '210 × 100', 'Suggested size', 'Desk tent calendar closed face; flat/die-line custom', false, true, '2026-11-04 11:17:46.743222+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (65, 4, 65, 'Product Display Stand', 300.00, 450.00, '11.81 × 17.72', '30 × 45', '300 × 450', 'Suggested size', 'Display stand frontage; 3D depth/die-line custom', false, true, '2026-11-04 11:17:46.743264+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (66, 4, 66, 'Hanging Display Card', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Suggested size', 'A4 hang card', false, true, '2026-11-04 11:17:46.743327+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (67, 4, 67, 'Promotional Sticker', 100.00, 100.00, '3.94 × 3.94', '10 × 10', '100 × 100', 'Suggested size', 'Die-cut varies', false, true, '2026-11-04 11:17:46.743375+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (68, 4, 68, 'Window Sticker', 600.00, 900.00, '23.62 × 35.43', '60 × 90', '600 × 900', 'Suggested size', 'Glass panel vinyl; site measurement required', false, true, '2026-11-04 11:17:46.743444+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (69, 4, 69, 'Floor Sticker', 300.00, 300.00, '11.81 × 11.81', '30 × 30', '300 × 300', 'Suggested size', 'Floor vinyl; site measurement required', false, true, '2026-11-04 11:17:46.743481+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (70, 4, 70, 'Door Hanger', 100.00, 250.00, '3.94 × 9.84', '10 × 25', '100 × 250', 'Suggested size', 'Die-cut hole and hanger neck extra', false, true, '2026-11-04 11:17:46.743521+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (71, 4, 71, 'Discount / Sale Tag', 50.00, 80.00, '1.97 × 3.15', '5 × 8', '50 × 80', 'Suggested size', 'Price tag', false, true, '2026-11-04 11:17:46.743594+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (72, 4, 72, 'Promotional Voucher', 210.00, 99.00, '8.27 × 3.90', '21 × 9.9', '210 × 99', 'Common size', 'DL', false, true, '2026-11-04 11:17:46.743647+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (73, 4, 73, 'Gift Voucher', 210.00, 99.00, '8.27 × 3.90', '21 × 9.9', '210 × 99', 'Common size', 'DL', false, true, '2026-11-04 11:17:46.743686+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (74, 4, 74, 'Loyalty Card', 85.60, 54.00, '3.37 × 2.13', '8.56 × 5.4', '85.6 × 54', 'Common size', 'CR80 card', false, true, '2026-11-04 11:17:46.743729+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (75, 5, 75, 'Product Packaging Box', 150.00, 200.00, '5.91 × 7.87', '15 × 20', '150 × 200', 'Custom / example', 'Front panel only; box requires L × W × H and die-line', false, true, '2026-11-04 11:17:46.743768+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (76, 5, 76, 'Folding Carton', 100.00, 150.00, '3.94 × 5.91', '10 × 15', '100 × 150', 'Custom / example', 'Front panel only; 3D carton dimensions required', false, true, '2026-11-04 11:17:46.743806+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (77, 5, 77, 'Corrugated Box', 300.00, 200.00, '11.81 × 7.87', '30 × 20', '300 × 200', 'Custom / example', 'Front panel only; L × W × H and board flute', false, true, '2026-11-04 11:17:46.743842+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (78, 5, 78, 'Food Packaging Box', 150.00, 100.00, '5.91 × 3.94', '15 × 10', '150 × 100', 'Custom / example', 'Front panel only; food box shape/height vary', false, true, '2026-11-04 11:17:46.743885+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (79, 5, 79, 'Pharmaceutical Packaging Box', 80.00, 120.00, '3.15 × 4.72', '8 × 12', '80 × 120', 'Custom / example', 'Front panel only; approved drug pack die-line', false, true, '2026-11-04 11:17:46.743923+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (80, 5, 80, 'Cosmetic Packaging Box', 80.00, 120.00, '3.15 × 4.72', '8 × 12', '80 × 120', 'Custom / example', 'Front panel only; box depth must be captured', false, true, '2026-11-04 11:17:46.74396+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (81, 5, 81, 'Product Label', 100.00, 60.00, '3.94 × 2.36', '10 × 6', '100 × 60', 'Suggested size', 'Sticker artwork dimensions', false, true, '2026-11-04 11:17:46.744002+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (82, 5, 82, 'Bottle Label', 100.00, 80.00, '3.94 × 3.15', '10 × 8', '100 × 80', 'Suggested size', 'Label dimensions; bottle circumference important', false, true, '2026-11-04 11:17:46.744048+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (83, 5, 83, 'Jar Label', 80.00, 50.00, '3.15 × 1.97', '8 × 5', '80 × 50', 'Suggested size', 'Jar size/circumference determine label', false, true, '2026-11-04 11:17:46.744113+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (84, 5, 84, 'Transparent Label', 100.00, 60.00, '3.94 × 2.36', '10 × 6', '100 × 60', 'Suggested size', 'Clear label size', false, true, '2026-11-04 11:17:46.744156+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (85, 5, 85, 'Paper Sticker', 50.00, 50.00, '1.97 × 1.97', '5 × 5', '50 × 50', 'Suggested size', 'Standard round/square option', false, true, '2026-11-04 11:17:46.744201+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (86, 5, 86, 'Vinyl Sticker', 100.00, 100.00, '3.94 × 3.94', '10 × 10', '100 × 100', 'Suggested size', 'Vinyl label', false, true, '2026-11-04 11:17:46.744238+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (87, 5, 87, 'Die-Cut Sticker', 75.00, 75.00, '2.95 × 2.95', '7.5 × 7.5', '75 × 75', 'Suggested size', 'Custom die-cut bounding box', false, true, '2026-11-04 11:17:46.744275+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (88, 5, 88, 'Barcode Label', 50.00, 30.00, '1.97 × 1.18', '5 × 3', '50 × 30', 'Suggested size', 'Barcode quiet zones required', false, true, '2026-11-04 11:17:46.744317+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (89, 5, 89, 'QR Code Label', 40.00, 40.00, '1.57 × 1.57', '4 × 4', '40 × 40', 'Suggested size', 'QR code legibility depends on scan distance', false, true, '2026-11-04 11:17:46.744378+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (90, 5, 90, 'Tamper-Evident Label', 30.00, 80.00, '1.18 × 3.15', '3 × 8', '30 × 80', 'Suggested size', 'Tamper seal shape custom', false, true, '2026-11-04 11:17:46.744416+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (91, 5, 91, 'Hang Tag', 50.00, 90.00, '1.97 × 3.54', '5 × 9', '50 × 90', 'Suggested size', 'Punched hole/die-cut extra', false, true, '2026-11-04 11:17:46.744495+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (92, 5, 92, 'Garment Tag', 50.00, 80.00, '1.97 × 3.15', '5 × 8', '50 × 80', 'Suggested size', 'Garment label/tag', false, true, '2026-11-04 11:17:46.744535+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (93, 5, 93, 'Paper Shopping Bag', 250.00, 300.00, '9.84 × 11.81', '25 × 30', '250 × 300', 'Custom / example', 'Bag front W × H only; gusset depth extra', false, true, '2026-11-04 11:17:46.744593+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (94, 5, 94, 'Kraft Paper Bag', 250.00, 300.00, '9.84 × 11.81', '25 × 30', '250 × 300', 'Custom / example', 'Bag front W × H only; gusset depth extra', false, true, '2026-11-04 11:17:46.744635+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (95, 5, 95, 'Wrapping Paper / Butter Paper', 500.00, 700.00, '19.69 × 27.56', '50 × 70', '500 × 700', 'Suggested size', 'Sheet; wrapping rolls customizable', false, true, '2026-11-04 11:17:46.744673+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (96, 6, 96, 'Invoice Book', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5', false, true, '2026-11-04 11:17:46.744713+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (97, 6, 97, 'Bill Book', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', '', false, true, '2026-11-04 11:17:46.744759+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (98, 6, 98, 'Cash Memo Book', 105.00, 148.00, '4.13 × 5.83', '10.5 × 14.8', '105 × 148', 'Common size', 'A6', false, true, '2026-11-04 11:17:46.744797+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (99, 6, 99, 'Receipt Book', 105.00, 148.00, '4.13 × 5.83', '10.5 × 14.8', '105 × 148', 'Common size', 'A6', false, true, '2026-11-04 11:17:46.744834+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (100, 6, 100, 'Delivery Challan Book', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', '', false, true, '2026-11-04 11:17:46.744876+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (101, 6, 101, 'Purchase Order Book', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.744919+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (102, 6, 102, 'NCR Duplicate Book', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5; number of plies separate', false, true, '2026-11-04 11:17:46.744982+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (103, 6, 103, 'NCR Triplicate Book', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5; number of plies separate', false, true, '2026-11-04 11:17:46.745024+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (104, 6, 104, 'Payment Voucher', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', '', false, true, '2026-11-04 11:17:46.745069+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (105, 6, 105, 'Receipt Voucher', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', '', false, true, '2026-11-04 11:17:46.745108+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (106, 6, 106, 'Gate Pass Book', 105.00, 148.00, '4.13 × 5.83', '10.5 × 14.8', '105 × 148', 'Common size', '', false, true, '2026-11-04 11:17:46.745145+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (107, 6, 107, 'Stock Register', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.745186+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (108, 6, 108, 'Attendance Register', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.745225+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (109, 6, 109, 'Application Form', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.745262+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (110, 6, 110, 'Feedback Form', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', '', false, true, '2026-11-04 11:17:46.745299+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (111, 6, 111, 'Order Form', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.745341+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (112, 7, 112, 'Flex Banner / Panaflex', 914.00, 1829.00, '35.98 × 72.01', '91.4 × 182.9', '914 × 1829', 'Suggested size', '3 × 6 ft example; custom banner sizes', false, true, '2026-11-04 11:17:46.745393+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (113, 7, 113, 'Vinyl Banner', 914.00, 1829.00, '35.98 × 72.01', '91.4 × 182.9', '914 × 1829', 'Suggested size', '3 × 6 ft example', false, true, '2026-11-04 11:17:46.745432+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (114, 7, 114, 'Roll-Up Standee', 850.00, 2000.00, '33.46 × 78.74', '85 × 200', '850 × 2000', 'Common size', 'Common hardware graphic size; check cassette bleed', false, true, '2026-11-04 11:17:46.74547+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (115, 7, 115, 'X-Stand Banner', 600.00, 1600.00, '23.62 × 62.99', '60 × 160', '600 × 1600', 'Common size', 'Common X-stand graphic size', false, true, '2026-11-04 11:17:46.74552+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (116, 7, 116, 'Outdoor Billboard Print', 6096.00, 3048.00, '240.00 × 120.00', '609.6 × 304.8', '6096 × 3048', 'Custom / example', '20 × 10 ft example; engineering/site dimensions', false, true, '2026-11-04 11:17:46.74556+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (117, 7, 117, 'Shop Signboard Graphics', 2438.00, 1219.00, '95.98 × 47.99', '243.8 × 121.9', '2438 × 1219', 'Custom / example', '8 × 4 ft example; board fabrication distinct', false, true, '2026-11-04 11:17:46.745598+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (118, 7, 118, 'Backdrop Banner', 3048.00, 2438.00, '120.00 × 95.98', '304.8 × 243.8', '3048 × 2438', 'Custom / example', '10 × 8 ft event backdrop', false, true, '2026-11-04 11:17:46.745641+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (119, 7, 119, 'Exhibition Wall Graphics', 3000.00, 2500.00, '118.11 × 98.43', '300 × 250', '3000 × 2500', 'Custom / example', 'One exhibition wall; verify panel seams', false, true, '2026-11-04 11:17:46.74568+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (120, 7, 120, 'One-Way Vision Sticker', 1000.00, 1000.00, '39.37 × 39.37', '100 × 100', '1000 × 1000', 'Custom / example', 'Measured window area', false, true, '2026-11-04 11:17:46.745719+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (121, 7, 121, 'Glass Branding Sticker', 1000.00, 1000.00, '39.37 × 39.37', '100 × 100', '1000 × 1000', 'Custom / example', 'Measured glass panel', false, true, '2026-11-04 11:17:46.745766+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (122, 7, 122, 'Wall Graphics / Wallpaper', 1000.00, 2500.00, '39.37 × 98.43', '100 × 250', '1000 × 2500', 'Custom / example', 'Wallpaper drop; wall height/site survey', false, true, '2026-11-04 11:17:46.745806+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (123, 7, 123, 'Vehicle Branding Sticker', 1000.00, 1000.00, '39.37 × 39.37', '100 × 100', '1000 × 1000', 'Custom / example', 'Vehicle-specific panel/template', false, true, '2026-11-04 11:17:46.745844+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (124, 7, 124, 'Outdoor Flag', 700.00, 2500.00, '27.56 × 98.43', '70 × 250', '700 × 2500', 'Suggested size', 'Flag graphic varies with hardware', false, true, '2026-11-04 11:17:46.745881+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (125, 7, 125, 'Indoor Promotional Banner', 914.00, 1829.00, '35.98 × 72.01', '91.4 × 182.9', '914 × 1829', 'Suggested size', '3 × 6 ft example', false, true, '2026-11-04 11:17:46.745928+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (126, 8, 126, 'Corporate Diary', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5 diary cover face', false, true, '2026-11-04 11:17:46.745966+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (127, 8, 127, 'Executive Diary', 170.00, 240.00, '6.69 × 9.45', '17 × 24', '170 × 240', 'Suggested size', 'Bespoke executive diary', false, true, '2026-11-04 11:17:46.746005+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (128, 8, 128, 'Branded Notebook', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5', false, true, '2026-11-04 11:17:46.746048+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (129, 8, 129, 'Wall Calendar', 297.00, 420.00, '11.69 × 16.54', '29.7 × 42', '297 × 420', 'Common size', 'A3 wall calendar sheet', false, true, '2026-11-04 11:17:46.746087+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (130, 8, 130, 'Desk Calendar', 210.00, 148.00, '8.27 × 5.83', '21 × 14.8', '210 × 148', 'Common size', 'A5 landscape desk calendar face', false, true, '2026-11-04 11:17:46.746125+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (131, 8, 131, 'Pocket Calendar', 85.00, 55.00, '3.35 × 2.17', '8.5 × 5.5', '85 × 55', 'Suggested size', 'Wallet calendar', false, true, '2026-11-04 11:17:46.746163+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (132, 8, 132, 'Corporate Greeting Card', 148.00, 105.00, '5.83 × 4.13', '14.8 × 10.5', '148 × 105', 'Common size', 'A6 folded card front; flat A5', false, true, '2026-11-04 11:17:46.746208+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (133, 8, 133, 'Eid Greeting Card', 148.00, 105.00, '5.83 × 4.13', '14.8 × 10.5', '148 × 105', 'Common size', 'A6 folded card front; flat A5', false, true, '2026-11-04 11:17:46.746246+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (134, 8, 134, 'New Year Greeting Card', 148.00, 105.00, '5.83 × 4.13', '14.8 × 10.5', '148 × 105', 'Common size', 'A6 folded card front; flat A5', false, true, '2026-11-04 11:17:46.746285+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (135, 8, 135, 'Branded Pen', 50.00, 7.00, '1.97 × 0.28', '5 × 0.7', '50 × 7', 'Custom / example', 'Printable barrel area only; pen dimensions vary', false, true, '2026-11-04 11:17:46.746329+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (136, 8, 136, 'Printed Mug', 200.00, 90.00, '7.87 × 3.54', '20 × 9', '200 × 90', 'Custom / example', 'Approximate print area/unwrapped artwork, not mug size', false, true, '2026-11-04 11:17:46.746368+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (137, 8, 137, 'Branded Gift Box', 200.00, 150.00, '7.87 × 5.91', '20 × 15', '200 × 150', 'Custom / example', 'Front panel only; L × W × H and die-line', false, true, '2026-11-04 11:17:46.746406+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (138, 8, 138, 'Corporate Gift Bag', 250.00, 300.00, '9.84 × 11.81', '25 × 30', '250 × 300', 'Custom / example', 'Bag W × H; gusset separately', false, true, '2026-11-04 11:17:46.74645+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (139, 8, 139, 'Customized Desk Planner', 210.00, 148.00, '8.27 × 5.83', '21 × 14.8', '210 × 148', 'Suggested size', 'Desk planner face', false, true, '2026-11-04 11:17:46.746489+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (140, 9, 140, 'Invitation Card', 127.00, 178.00, '5.00 × 7.01', '12.7 × 17.8', '127 × 178', 'Common size', '5 × 7 in nominal', false, true, '2026-11-04 11:17:46.746527+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (141, 9, 141, 'Event Entry Pass', 100.00, 150.00, '3.94 × 5.91', '10 × 15', '100 × 150', 'Suggested size', 'Event pass card', false, true, '2026-11-04 11:17:46.746565+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (142, 9, 142, 'Event Badge', 90.00, 120.00, '3.54 × 4.72', '9 × 12', '90 × 120', 'Suggested size', 'Badge insert, not holder', false, true, '2026-11-04 11:17:46.746609+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (143, 9, 143, 'Event Lanyard', 900.00, 20.00, '35.43 × 0.79', '90 × 2', '900 × 20', 'Suggested size', 'Flat strap length × width; double-sided printing', false, true, '2026-11-04 11:17:46.746647+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (144, 9, 144, 'Exhibition Catalogue', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.746686+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (145, 9, 145, 'Event Programme Booklet', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', '', false, true, '2026-11-04 11:17:46.746735+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (146, 9, 146, 'Conference Folder', 230.00, 310.00, '9.06 × 12.20', '23 × 31', '230 × 310', 'Suggested size', 'Folder closed size', false, true, '2026-11-04 11:17:46.746775+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (147, 9, 147, 'Certificate', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.746813+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (148, 9, 148, 'Award Certificate', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.746851+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (149, 9, 149, 'Thank You Card', 148.00, 105.00, '5.83 × 4.13', '14.8 × 10.5', '148 × 105', 'Common size', 'A6 folded front', false, true, '2026-11-04 11:17:46.7469+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (150, 9, 150, 'Event Ticket', 150.00, 60.00, '5.91 × 2.36', '15 × 6', '150 × 60', 'Suggested size', 'Ticket; tear-off/perforation optional', false, true, '2026-11-04 11:17:46.746938+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (151, 9, 151, 'Event Backdrop', 3048.00, 2438.00, '120.00 × 95.98', '304.8 × 243.8', '3048 × 2438', 'Custom / example', '10 × 8 ft', false, true, '2026-11-04 11:17:46.746991+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (152, 9, 152, 'Booth Branding Graphics', 3000.00, 2500.00, '118.11 × 98.43', '300 × 250', '3000 × 2500', 'Custom / example', 'Wall panel; actual booth layout required', false, true, '2026-11-04 11:17:46.74704+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (153, 9, 153, 'Table Name Card', 100.00, 70.00, '3.94 × 2.76', '10 × 7', '100 × 70', 'Suggested size', 'Folded name card visible face', false, true, '2026-11-04 11:17:46.74708+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (154, 10, 154, 'Single-Page Menu', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.747118+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (155, 10, 155, 'Bi-Fold Menu', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5 closed; A4 open', false, true, '2026-11-04 11:17:46.747156+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (156, 10, 156, 'Tri-Fold Menu', 99.00, 210.00, '3.90 × 8.27', '9.9 × 21', '99 × 210', 'Common size', 'DL closed; A4 open', false, true, '2026-11-04 11:17:46.747201+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (157, 10, 157, 'Multi-Page Menu', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4 bound menu', false, true, '2026-11-04 11:17:46.747238+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (158, 10, 158, 'Table Tent Menu', 100.00, 210.00, '3.94 × 8.27', '10 × 21', '100 × 210', 'Suggested size', 'Face, flat layout depends on folds', false, true, '2026-11-04 11:17:46.747278+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (159, 10, 159, 'Takeaway Menu', 210.00, 99.00, '8.27 × 3.90', '21 × 9.9', '210 × 99', 'Common size', 'DL', false, true, '2026-11-04 11:17:46.747322+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (160, 10, 160, 'Pizza Box', 300.00, 300.00, '11.81 × 11.81', '30 × 30', '300 × 300', 'Custom / example', 'Top-panel W × H only; box height extra', false, true, '2026-11-04 11:17:46.747374+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (161, 10, 161, 'Burger Box', 120.00, 120.00, '4.72 × 4.72', '12 × 12', '120 × 120', 'Custom / example', 'Top-panel W × H only; box height extra', false, true, '2026-11-04 11:17:46.747411+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (162, 10, 162, 'Food Paper Bag', 250.00, 300.00, '9.84 × 11.81', '25 × 30', '250 × 300', 'Custom / example', 'Bag front W × H; gusset extra', false, true, '2026-11-04 11:17:46.747454+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (163, 10, 163, 'Food Wrapping Paper', 300.00, 300.00, '11.81 × 11.81', '30 × 30', '300 × 300', 'Suggested size', 'Wrapping sheet', false, true, '2026-11-04 11:17:46.747493+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (164, 10, 164, 'Cup Sleeve', 230.00, 60.00, '9.06 × 2.36', '23 × 6', '230 × 60', 'Custom / example', 'Approx. flat sleeve dieline; depends on cup', false, true, '2026-11-04 11:17:46.74753+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (165, 10, 165, 'Food Label', 70.00, 50.00, '2.76 × 1.97', '7 × 5', '70 × 50', 'Suggested size', 'Food safety info varies', false, true, '2026-11-04 11:17:46.747566+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (166, 10, 166, 'Delivery Packaging Sticker', 70.00, 70.00, '2.76 × 2.76', '7 × 7', '70 × 70', 'Suggested size', 'Tamper label may be rectangular', false, true, '2026-11-04 11:17:46.747609+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (167, 11, 167, 'Medicine Packaging Carton', 80.00, 120.00, '3.15 × 4.72', '8 × 12', '80 × 120', 'Custom / example', 'Front panel only; carton needs 3D and approved die-line', false, true, '2026-11-04 11:17:46.747646+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (168, 11, 168, 'Medicine Information Leaflet', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'Folded A5; small inserts often custom', false, true, '2026-11-04 11:17:46.747683+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (169, 11, 169, 'Medical Product Catalogue', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.747728+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (170, 11, 170, 'Doctor Detail Aid', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4; some multi-fold', false, true, '2026-11-04 11:17:46.747766+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (171, 11, 171, 'Medical Visual Aid', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4 visual aid page', false, true, '2026-11-04 11:17:46.747803+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (172, 11, 172, 'Prescription Pad', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5', false, true, '2026-11-04 11:17:46.74784+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (173, 11, 173, 'Patient Registration Form', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.747883+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (174, 11, 174, 'Laboratory Report Folder', 230.00, 310.00, '9.06 × 12.20', '23 × 31', '230 × 310', 'Suggested size', 'A4-fit closed folder', false, true, '2026-11-04 11:17:46.74792+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (175, 11, 175, 'Laboratory Report Envelope', 324.00, 229.00, '12.76 × 9.02', '32.4 × 22.9', '324 × 229', 'Common size', 'C4 envelope', false, true, '2026-11-04 11:17:46.747956+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (176, 11, 176, 'Patient Information Brochure', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5 closed', false, true, '2026-11-04 11:17:46.748+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (177, 11, 177, 'Medical Awareness Poster', 420.00, 594.00, '16.54 × 23.39', '42 × 59.4', '420 × 594', 'Common size', 'A2', false, true, '2026-11-04 11:17:46.748037+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (178, 11, 178, 'Hospital File Cover', 230.00, 310.00, '9.06 × 12.20', '23 × 31', '230 × 310', 'Suggested size', 'A4-fit cover', false, true, '2026-11-04 11:17:46.748074+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (179, 11, 179, 'Sample Collection Label', 50.00, 25.00, '1.97 × 0.98', '5 × 2.5', '50 × 25', 'Suggested size', 'Small vial/sample label; printer stock depends', false, true, '2026-11-04 11:17:46.748116+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (180, 12, 180, 'School / College Prospectus', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.748154+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (181, 12, 181, 'Admission Form', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.748191+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (182, 12, 182, 'Examination Answer Sheet', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.748227+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (183, 12, 183, 'Student ID Card', 85.60, 54.00, '3.37 × 2.13', '8.56 × 5.4', '85.6 × 54', 'Common size', 'CR80', false, true, '2026-11-04 11:17:46.748268+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (184, 12, 184, 'Certificate / Diploma', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', 'A4', false, true, '2026-11-04 11:17:46.748306+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (185, 12, 185, 'School Diary', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5', false, true, '2026-11-04 11:17:46.748343+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (186, 12, 186, 'Real Estate Project Brochure', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.748388+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (187, 12, 187, 'Property Sales Folder', 230.00, 310.00, '9.06 × 12.20', '23 × 31', '230 × 310', 'Suggested size', 'A4-fit folder', false, true, '2026-11-04 11:17:46.748427+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (188, 12, 188, 'Property Floor Plan Sheet', 297.00, 420.00, '11.69 × 16.54', '29.7 × 42', '297 × 420', 'Common size', 'A3', false, true, '2026-11-04 11:17:46.748464+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (189, 12, 189, 'Project Presentation Booklet', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.748501+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (190, 12, 190, 'Industrial Product Catalogue', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.748546+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (191, 12, 191, 'Technical Data Sheet', 210.00, 297.00, '8.27 × 11.69', '21 × 29.7', '210 × 297', 'Common size', '', false, true, '2026-11-04 11:17:46.748583+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (192, 12, 192, 'Safety Instruction Poster', 420.00, 594.00, '16.54 × 23.39', '42 × 59.4', '420 × 594', 'Common size', 'A2', false, true, '2026-11-04 11:17:46.748619+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (193, 12, 193, 'Equipment Instruction Label', 100.00, 70.00, '3.94 × 2.76', '10 × 7', '100 × 70', 'Suggested size', 'Varies by machinery', false, true, '2026-11-04 11:17:46.748661+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (194, 12, 194, 'Warranty Card', 85.60, 54.00, '3.37 × 2.13', '8.56 × 5.4', '85.6 × 54', 'Common size', 'CR80 option; A6 also used', false, true, '2026-11-04 11:17:46.7487+05');
INSERT INTO public.printing_items OVERRIDING SYSTEM VALUE VALUES (195, 12, 195, 'Product Instruction Manual', 148.00, 210.00, '5.83 × 8.27', '14.8 × 21', '148 × 210', 'Common size', 'A5', false, true, '2026-11-04 11:17:46.748737+05');


--
-- Data for Name: printing_machine_rates; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.printing_machine_rates OVERRIDING SYSTEM VALUE VALUES (1, 'GTO 46', 350.0000, 1400.0000, 500.0000, 2000.0000, 1, true, '2026-11-11 12:19:11.244856+05', '2026-11-12 10:07:53.997944+05');
INSERT INTO public.printing_machine_rates OVERRIDING SYSTEM VALUE VALUES (2, 'GTO 52', 375.0000, 1600.0000, 550.0000, 2200.0000, 2, true, '2026-11-11 12:19:11.334533+05', '2026-11-12 10:07:54.001887+05');
INSERT INTO public.printing_machine_rates OVERRIDING SYSTEM VALUE VALUES (3, 'Solna 125', 550.0000, 2200.0000, 800.0000, 3200.0000, 3, true, '2026-11-11 12:19:11.337597+05', '2026-11-12 10:07:54.003125+05');
INSERT INTO public.printing_machine_rates OVERRIDING SYSTEM VALUE VALUES (4, 'Heidelberg', 1000.0000, 4000.0000, 1500.0000, 6000.0000, 4, true, '2026-11-11 12:19:11.339205+05', '2026-11-12 10:07:54.004205+05');


--
-- Data for Name: printing_materials; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.printing_materials OVERRIDING SYSTEM VALUE VALUES (1, 'ART CARD', 25.000, 36.000, 300.000, NULL, 500, 3100.0000, 'PacketPrice', 8100.0000, 100, true, '2026-11-04 11:17:46.882305+05', '2026-11-04 11:17:46.882305+05');
INSERT INTO public.printing_materials OVERRIDING SYSTEM VALUE VALUES (2, 'OFFSET PAPER', 23.000, 36.000, 100.000, 680.0000, 500, 3100.0000, 'RatePerKg', NULL, NULL, true, '2026-11-04 11:17:46.882623+05', '2026-11-04 11:17:46.882623+05');
INSERT INTO public.printing_materials OVERRIDING SYSTEM VALUE VALUES (3, 'ART/MATT PAPER', NULL, NULL, NULL, NULL, 500, 3100.0000, 'RatePerKg', NULL, NULL, true, '2026-11-04 11:17:46.882652+05', '2026-11-04 11:17:46.882652+05');
INSERT INTO public.printing_materials OVERRIDING SYSTEM VALUE VALUES (4, 'Carbonless Paper', NULL, NULL, NULL, NULL, 500, 3100.0000, 'RatePerKg', NULL, NULL, true, '2026-11-04 11:17:46.882652+05', '2026-11-04 11:17:46.882652+05');
INSERT INTO public.printing_materials OVERRIDING SYSTEM VALUE VALUES (5, 'FLYING PAPER', NULL, NULL, NULL, NULL, 500, 3100.0000, 'RatePerKg', NULL, NULL, true, '2026-11-04 11:17:46.882652+05', '2026-11-04 11:17:46.882652+05');
INSERT INTO public.printing_materials OVERRIDING SYSTEM VALUE VALUES (6, 'Bleach Card', NULL, NULL, NULL, NULL, 500, 3100.0000, 'RatePerKg', NULL, NULL, true, '2026-11-04 11:17:46.882653+05', '2026-11-04 11:17:46.882653+05');
INSERT INTO public.printing_materials OVERRIDING SYSTEM VALUE VALUES (7, 'Box Board', NULL, NULL, NULL, NULL, 500, 3100.0000, 'RatePerKg', NULL, NULL, true, '2026-11-04 11:17:46.882653+05', '2026-11-04 11:17:46.882653+05');
INSERT INTO public.printing_materials OVERRIDING SYSTEM VALUE VALUES (8, 'Sticker', NULL, NULL, NULL, NULL, 500, 3100.0000, 'DirectSheetPrice', NULL, NULL, true, '2026-11-04 11:17:46.882654+05', '2026-11-04 11:17:46.882654+05');


--
-- Data for Name: printing_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (1, 1, 3, 'Corporate Brochures (Updated)', NULL, 'A4 Folded', 'Art Card', '300 GSM', '4/4 Full Color', 'Matte Lamination + Spot UV', 3000.000, 'pcs', 55.00, 165000.00, 'IN_HOUSE', NULL);
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (2, 2, 6, 'Corporate Brochures (Updated)', '', 'A4 Folded', 'Art Card', '300 GSM', '4/4 Full Color', 'Matte Lamination + Spot UV', 3000.000, 'pcs', 55.00, 165000.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (3, 3, 10, 'flyers', '', 'a5', 'art paper', '128', '4', 'no', 1000.000, '1000', 5.50, 5500.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (4, 4, 12, 'On-Page & Technical SEO Setup', NULL, NULL, NULL, NULL, NULL, NULL, 1.000, 'service', 25000.00, 25000.00, 'IN_HOUSE', 'Keyword research, meta tags, schema markup');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (5, 4, 11, 'Crown Corporate Portal Development', NULL, NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 110000.00, 110000.00, 'IN_HOUSE', 'Includes 1 year domain & cloud hosting');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (6, 5, 13, 'Crown Corporate Portal Development', NULL, NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 110000.00, 110000.00, 'IN_HOUSE', 'Includes 1 year domain & cloud hosting');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (7, 5, 14, 'On-Page & Technical SEO Setup', NULL, NULL, NULL, NULL, NULL, NULL, 1.000, 'service', 25000.00, 25000.00, 'IN_HOUSE', 'Keyword research, meta tags, schema markup');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (8, 6, 15, 'Corporate Website Development', '5-page responsive business website with contact form and SEO setup', NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 85000.00, 85000.00, 'IN_HOUSE', 'Includes 1 year maintenance');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (9, 6, 16, 'SEO Services', 'Complete on-page optimization, Google Search Console, and meta tags', NULL, NULL, NULL, NULL, NULL, 1.000, 'service', 25000.00, 25000.00, 'IN_HOUSE', NULL);
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (10, 7, 18, 'Monthly Growth Marketing', 'Complete monthly digital marketing management', NULL, NULL, NULL, NULL, NULL, 1.000, 'month', 85000.00, 85000.00, 'IN_HOUSE', NULL);
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (11, 7, 17, 'Custom Corporate Website', 'Custom Angular & .NET portal with WhatsApp integration', NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 75000.00, 75000.00, 'IN_HOUSE', NULL);
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (12, 8, 20, 'Monthly Growth Marketing', 'Monthly marketing posts and reels management', NULL, NULL, NULL, NULL, NULL, 1.000, 'month', 85000.00, 85000.00, 'IN_HOUSE', NULL);
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (13, 8, 19, 'Custom Corporate Website', 'Custom Angular & .NET portal with WhatsApp integration', NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 75000.00, 75000.00, 'IN_HOUSE', NULL);
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (14, 9, 32, 'Digital Marketing Campaign', '', '', '', '', '', '', 1.000, 'pcs', 90000.00, 90000.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (15, 10, 22, 'Digital Marketing Campaign', '', NULL, NULL, NULL, NULL, NULL, 10.000, 'month', 110.00, 1100.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (16, 11, 27, 'Hammed Latif website', '', NULL, NULL, NULL, NULL, NULL, 1.000, 'pcs', 100023.00, 100023.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (17, 11, 26, 'Digital Marketing Campaign', '', NULL, NULL, NULL, NULL, NULL, 10.000, 'month', 110.00, 1100.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (18, 12, 34, 'Digital Marketing Campaign', '', '', '', '', '', '', 1.000, 'pcs', 90000.00, 90000.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (19, 13, 35, 'Digital Marketing Campaign', '', '', '', '', '', '', 1.000, 'pcs', 90000.00, 90000.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (20, 14, 36, 'Outsourced Banners', NULL, NULL, NULL, NULL, NULL, NULL, 100.000, 'pcs', 500.00, 50000.00, 'OUTSOURCED', NULL);
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (21, 13, 37, 'Digital Marketing Campaign', '', '', '', '', '', '', 1.000, 'pcs', 90000.00, 90000.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (22, 14, 38, 'Outsourced Banners', '', '', '', '', '', '', 100.000, 'pcs', 500.00, 50000.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (23, 15, 39, 'Digital Marketing Campaign', '', NULL, NULL, NULL, NULL, NULL, 1.000, '12', 10000.00, 10000.00, 'OUTSOURCED', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (24, 14, 40, 'Outsourced Banners', '', '', '', '', '', '', 100.000, 'pcs', 500.00, 50000.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (25, 14, 41, 'Outsourced Banners', '', '', '', '', '', '', 100.000, 'pcs', 500.00, 50000.00, 'IN_HOUSE', '');
INSERT INTO public.printing_order_items OVERRIDING SYSTEM VALUE VALUES (26, 16, 42, 'Outsourced Banners', '', '', '', '', '', '', 100.000, 'pcs', 500.00, 50000.00, 'IN_HOUSE', '');


--
-- Data for Name: printing_orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (1, 'PO-2026-0001', 1, 1, NULL, 'Crown Group', 'Naveed Ahmad', '+92 300 8888888', 'naveed@crowngroup.pk', 'Industrial Area, Lahore', 'Confirmed', 'IN_HOUSE', 165000.00, 16500.00, 23760.00, 172260.00, NULL, '2026-11-02 16:39:11.788966+05', 'Quotation Production Sync', '2026-11-02 16:39:11.058523+05', '2026-11-02 16:39:11.788966+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (2, 'PO-2026-0002', 1, 2, NULL, 'Crown Group', 'Naveed Ahmad', '+92 300 8888888', 'naveed@crowngroup.pk', 'Industrial Area, Lahore', 'Confirmed', 'IN_HOUSE', 165000.00, 1650.00, 26136.00, 189486.00, '', '2026-11-02 16:39:12.006763+05', 'Quotation Production Sync', '2026-11-02 16:39:11.979497+05', '2026-11-02 16:39:12.006763+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (4, 'PO-2026-0004', 3, 4, NULL, 'Crown Digital Solutions', 'Mr. Hamza Tariq', '0300-8889999', 'hamza@crowndigital.pk', NULL, 'Confirmed', 'IN_HOUSE', 135000.00, 6750.00, 0.00, 128250.00, NULL, '2026-11-02 16:39:12.178425+05', 'Quotation Production Sync', '2026-11-02 16:39:12.151779+05', '2026-11-02 16:39:12.178425+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (5, 'PO-2026-0005', 4, 5, NULL, 'Crown Digital Solutions', 'Mr. Hamza Tariq', '0300-8889999', 'hamza@crowndigital.pk', NULL, 'Confirmed', 'IN_HOUSE', 135000.00, 6750.00, 0.00, 128250.00, NULL, '2026-11-02 16:39:12.226058+05', 'Quotation Production Sync', '2026-11-02 16:39:12.202818+05', '2026-11-02 16:39:12.226058+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (6, 'PO-2026-0006', 5, 6, NULL, 'Crown Digital Solutions', 'Mr. Hamza Tariq', '0300-8889999', 'hamza@crowndigital.pk', NULL, 'Confirmed', 'IN_HOUSE', 110000.00, 5000.00, 0.00, 105000.00, NULL, '2026-11-02 16:39:12.27385+05', 'Quotation Production Sync', '2026-11-02 16:39:12.250068+05', '2026-11-02 16:39:12.27385+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (7, 'PO-2026-0007', 6, 7, NULL, 'Crown Digital Solutions', 'Naveed Ahmad', '+92 300 9876543', 'naveed@crowndigital.pk', 'Phase 5, DHA, Lahore', 'Confirmed', 'IN_HOUSE', 160000.00, 8000.00, 0.00, 152000.00, 'Complete digital presence package', '2026-11-02 16:39:12.323805+05', 'Quotation Production Sync', '2026-11-02 16:39:12.297237+05', '2026-11-02 16:39:12.323805+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (8, 'PO-2026-0008', 7, 8, NULL, 'Crown Digital Solutions', 'Naveed Ahmad', '+92 300 9876543', 'naveed@crowndigital.pk', 'Phase 5, DHA, Lahore', 'Confirmed', 'IN_HOUSE', 160000.00, 8000.00, 0.00, 152000.00, 'Complete digital presence package', '2026-11-02 16:39:12.394464+05', 'Quotation Production Sync', '2026-11-02 16:39:12.368144+05', '2026-11-02 16:39:12.394464+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (15, 'PO-2026-0015', 11, 15, 9, 'Systems', 'Umair', '03134565030', 'ranaumairofficial2@gmail.com', 'Near Lahore', 'Confirmed', 'OUTSOURCED', 10000.00, 500.00, 1710.00, 11210.00, '', '2026-11-02 17:42:11.743958+05', 'Quotation Production Sync', '2026-11-02 17:42:06.6206+05', '2026-11-02 17:42:11.743958+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (14, 'PO-2026-0014', 10, 14, NULL, 'Vendor Test Client', NULL, '+92 300 1234567', '', '', 'Confirmed', 'MIXED', 50000.00, 0.00, 0.00, 50000.00, NULL, '2026-11-03 10:15:28.306745+05', 'Quotation Production Sync', '2026-11-02 16:40:12.229642+05', '2026-11-03 10:15:28.306745+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (16, 'PO-2026-0016', 10, 16, NULL, 'Vendor Test Client', '', '+92 300 1234567', '', '', 'Confirmed', 'IN_HOUSE', 50000.00, 0.00, 0.00, 50000.00, '', '2026-11-03 10:15:45.118008+05', 'Quotation Production Sync', '2026-11-03 10:15:45.062976+05', '2026-11-03 10:15:45.118008+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (3, 'PO-2026-0003', 2, 3, NULL, 'Alpha Graphics Ltd', 'Bilal Khan', '03218401998', 'bilal@alphagraphics.pk', 'Main Boulevard, Gulberg, Lahore2', 'Confirmed', 'IN_HOUSE', 5500.00, 1000.00, 247.50, 4747.50, 'digital print krwa kr deny hain', '2026-11-02 16:39:12.10914+05', 'Quotation Production Sync', '2026-11-02 16:39:12.032281+05', '2026-11-02 16:39:12.10914+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (9, 'PO-2026-0009', 8, 9, NULL, 'Auto Tech Corp 48148', 'Usman Tariq', '+92 345 48148', 'usman@autotech48148.pk', 'Gulberg III, Lahore', 'Confirmed', 'IN_HOUSE', 90000.00, 0.00, 0.00, 90000.00, '', '2026-11-02 16:39:12.437444+05', 'Quotation Production Sync', '2026-11-02 16:39:12.417188+05', '2026-11-02 16:39:12.437444+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (12, 'PO-2026-0012', 8, 12, NULL, 'Auto Tech Corp 48148', 'Usman Tariq', '+92 345 48148', 'usman@autotech48148.pk', 'Gulberg III, Lahore', 'Confirmed', 'IN_HOUSE', 90000.00, 0.00, 0.00, 90000.00, '', '2026-11-02 16:39:12.571821+05', 'Quotation Production Sync', '2026-11-02 16:39:12.549042+05', '2026-11-02 16:39:12.571821+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (13, 'PO-2026-0013', 8, 13, NULL, 'Auto Tech Corp 48148', 'Usman Tariq', '+92 345 48148', 'usman@autotech48148.pk', 'Gulberg III, Lahore', 'Confirmed', 'IN_HOUSE', 90000.00, 0.00, 0.00, 90000.00, '', '2026-11-02 16:47:58.584264+05', 'Quotation Production Sync', '2026-11-02 16:39:12.594985+05', '2026-11-02 16:47:58.584264+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (10, 'PO-2026-0010', 9, 10, NULL, 'ZeroPixel', 'Naveed', '03134565031', 'ur1988228@gmail.com', 'Street No 9 House No 6', 'Confirmed', 'IN_HOUSE', 1100.00, 0.00, 0.00, 1100.00, '', '2026-11-02 16:39:12.478669+05', 'Quotation Production Sync', '2026-11-02 16:39:12.457859+05', '2026-11-02 16:39:12.478669+05');
INSERT INTO public.printing_orders OVERRIDING SYSTEM VALUE VALUES (11, 'PO-2026-0011', 9, 11, NULL, 'ZeroPixel', 'Naveed', '03134565031', 'ur1988228@gmail.com', 'Street No 9 House No 6', 'Confirmed', 'IN_HOUSE', 101123.00, 20000.00, 6489.84, 87612.84, '', '2026-11-02 16:39:12.526503+05', 'Quotation Production Sync', '2026-11-02 16:39:12.503699+05', '2026-11-02 16:39:12.526503+05');


--
-- Data for Name: printing_sizes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (1, 'A6', 105.00, 148.00, true, 1, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (2, 'A5', 148.00, 210.00, true, 2, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (3, 'A4', 210.00, 297.00, true, 3, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (4, 'A3', 297.00, 420.00, true, 4, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (5, 'A2', 420.00, 594.00, true, 5, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (6, 'A1', 594.00, 841.00, true, 6, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (7, 'DL finished', 99.00, 210.00, true, 7, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (8, 'C5 envelope', 229.00, 162.00, true, 8, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (9, 'C4 envelope', 324.00, 229.00, true, 9, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (10, 'CR80 ID card', 85.60, 54.00, true, 10, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (11, 'Common 3×6 ft banner', 914.40, 1828.80, true, 11, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (12, 'Common 8×4 ft board', 2438.40, 1219.20, true, 12, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (13, 'Common roll-up', 850.00, 2000.00, true, 13, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (14, 'Custom Size', NULL, NULL, true, 999, '2026-11-04 11:44:21.707229+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (15, 'Standard Business Card / Visiting Card (89.00 × 51.00 mm)', 89.00, 51.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (16, 'DL Envelope (220.00 × 110.00 mm)', 220.00, 110.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (17, 'Document Envelope (330.00 × 254.00 mm)', 330.00, 254.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (18, 'Corporate Presentation Folder (230.00 × 310.00 mm)', 230.00, 310.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (19, 'Corporate Stamp (60.00 × 25.00 mm)', 60.00, 25.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (20, 'Coffee Table Book (300.00 × 300.00 mm)', 300.00, 300.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (21, 'Shelf Talker (150.00 × 100.00 mm)', 150.00, 100.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (22, 'Shelf Wobbler (100.00 × 100.00 mm)', 100.00, 100.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (23, 'Danglers (300.00 × 450.00 mm)', 300.00, 450.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (24, 'Bunting (150.00 × 200.00 mm)', 150.00, 200.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (25, 'Streamers (100.00 × 600.00 mm)', 100.00, 600.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (26, 'Window Sticker (600.00 × 900.00 mm)', 600.00, 900.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (27, 'Door Hanger (100.00 × 250.00 mm)', 100.00, 250.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (28, 'Discount / Sale Tag (50.00 × 80.00 mm)', 50.00, 80.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (29, 'Corrugated Box (300.00 × 200.00 mm)', 300.00, 200.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (30, 'Pharmaceutical Packaging Box (80.00 × 120.00 mm)', 80.00, 120.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (31, 'Product Label (100.00 × 60.00 mm)', 100.00, 60.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (32, 'Bottle Label (100.00 × 80.00 mm)', 100.00, 80.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (33, 'Paper Sticker (50.00 × 50.00 mm)', 50.00, 50.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (34, 'Die-Cut Sticker (75.00 × 75.00 mm)', 75.00, 75.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (35, 'Barcode Label (50.00 × 30.00 mm)', 50.00, 30.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (36, 'QR Code Label (40.00 × 40.00 mm)', 40.00, 40.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (37, 'Tamper-Evident Label (30.00 × 80.00 mm)', 30.00, 80.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (38, 'Paper Shopping Bag (250.00 × 300.00 mm)', 250.00, 300.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (39, 'Wrapping Paper / Butter Paper (500.00 × 700.00 mm)', 500.00, 700.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (40, 'X-Stand Banner (600.00 × 1600.00 mm)', 600.00, 1600.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (41, 'Outdoor Billboard Print (6096.00 × 3048.00 mm)', 6096.00, 3048.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (42, 'Backdrop Banner (3048.00 × 2438.00 mm)', 3048.00, 2438.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (43, 'Exhibition Wall Graphics (3000.00 × 2500.00 mm)', 3000.00, 2500.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (44, 'One-Way Vision Sticker (1000.00 × 1000.00 mm)', 1000.00, 1000.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (45, 'Wall Graphics / Wallpaper (1000.00 × 2500.00 mm)', 1000.00, 2500.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (46, 'Outdoor Flag (700.00 × 2500.00 mm)', 700.00, 2500.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (47, 'Executive Diary (170.00 × 240.00 mm)', 170.00, 240.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (48, 'Branded Pen (50.00 × 7.00 mm)', 50.00, 7.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (49, 'Printed Mug (200.00 × 90.00 mm)', 200.00, 90.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (50, 'Invitation Card (127.00 × 178.00 mm)', 127.00, 178.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (51, 'Event Badge (90.00 × 120.00 mm)', 90.00, 120.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (52, 'Event Lanyard (900.00 × 20.00 mm)', 900.00, 20.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (53, 'Event Ticket (150.00 × 60.00 mm)', 150.00, 60.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (54, 'Table Name Card (100.00 × 70.00 mm)', 100.00, 70.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (55, 'Burger Box (120.00 × 120.00 mm)', 120.00, 120.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (56, 'Cup Sleeve (230.00 × 60.00 mm)', 230.00, 60.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (57, 'Food Label (70.00 × 50.00 mm)', 70.00, 50.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (58, 'Delivery Packaging Sticker (70.00 × 70.00 mm)', 70.00, 70.00, true, 100, '2026-11-04 11:44:21.719428+05');
INSERT INTO public.printing_sizes OVERRIDING SYSTEM VALUE VALUES (59, 'Sample Collection Label (50.00 × 25.00 mm)', 50.00, 25.00, true, 100, '2026-11-04 11:44:21.719428+05');


--
-- Data for Name: production_job_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.production_job_items OVERRIDING SYSTEM VALUE VALUES (26, 16, 23);
INSERT INTO public.production_job_items OVERRIDING SYSTEM VALUE VALUES (34, 15, 22);
INSERT INTO public.production_job_items OVERRIDING SYSTEM VALUE VALUES (35, 15, 24);
INSERT INTO public.production_job_items OVERRIDING SYSTEM VALUE VALUES (36, 15, 25);
INSERT INTO public.production_job_items OVERRIDING SYSTEM VALUE VALUES (37, 14, 20);
INSERT INTO public.production_job_items OVERRIDING SYSTEM VALUE VALUES (38, 17, 26);


--
-- Data for Name: production_job_sheets; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.production_job_sheets OVERRIDING SYSTEM VALUE VALUES (3, 'Books', '2026-11-10 05:00:00+05', 'Naveed', 'Printer', 10, '10', 'A4', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-10 17:49:11.20733+05', '2026-11-10 17:49:51.712768+05');


--
-- Data for Name: production_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.production_jobs OVERRIDING SYSTEM VALUE VALUES (15, 'JOB-IH-2026-0001', 14, 'IN_HOUSE', 'Completed', 'Normal', '2026-11-02 17:08:16.64377+05', '2026-11-05 17:08:16.64377+05', '2026-11-02 18:24:08.157303+05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-02 17:08:16.64377+05', '2026-11-03 10:15:28.306745+05');
INSERT INTO public.production_jobs OVERRIDING SYSTEM VALUE VALUES (17, 'JOB-IH-2026-0002', 16, 'IN_HOUSE', 'Completed', 'Normal', '2026-11-03 10:15:45.118008+05', '2026-11-06 05:00:00+05', '2026-11-03 10:16:19.915801+05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-03 10:15:45.118008+05', '2026-11-03 10:16:19.915801+05');
INSERT INTO public.production_jobs OVERRIDING SYSTEM VALUE VALUES (14, 'JOB-OS-2026-0001', 14, 'OUTSOURCED', 'Completed', 'Normal', '2026-11-02 16:40:12.267198+05', '2026-11-07 16:40:12.267198+05', '2026-11-04 16:46:50.487098+05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-02 16:40:12.267198+05', '2026-11-04 16:46:50.487098+05');
INSERT INTO public.production_jobs OVERRIDING SYSTEM VALUE VALUES (16, 'JOB-OS-2026-0002', 15, 'OUTSOURCED', 'Delivered', 'Normal', '2026-11-02 17:42:06.863893+05', '2026-11-07 17:42:06.863893+05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-02 17:42:06.863893+05', '2026-11-04 16:47:03.1654+05');


--
-- Data for Name: quotation_approval_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.quotation_approval_logs OVERRIDING SYSTEM VALUE VALUES (1, 1, 'Approved', 'WhatsApp', 'Naveed Ahmad', '2026-10-30 15:27:20.655788+05', 'Client approved quotation with 50% advance agreement', '2026-10-30 15:27:20.655788+05');
INSERT INTO public.quotation_approval_logs OVERRIDING SYSTEM VALUE VALUES (2, 1, 'Approved', 'WhatsApp', 'Naveed Ahmad', '2026-10-30 16:22:20.956287+05', '', '2026-10-30 16:22:20.956287+05');
INSERT INTO public.quotation_approval_logs OVERRIDING SYSTEM VALUE VALUES (3, 1, 'Revision Requested', 'WhatsApp', 'Naveed Ahmad', '2026-10-30 16:25:25.315197+05', '', '2026-10-30 16:25:25.315197+05');
INSERT INTO public.quotation_approval_logs OVERRIDING SYSTEM VALUE VALUES (4, 2, 'Approved', 'WhatsApp', 'Naveed Ahmad', '2026-10-30 17:01:30.88043+05', '', '2026-10-30 17:01:30.88043+05');
INSERT INTO public.quotation_approval_logs OVERRIDING SYSTEM VALUE VALUES (5, 3, 'Approved', 'WhatsApp', 'Bilal Khan', '2026-10-30 17:11:37.477862+05', '', '2026-10-30 17:11:37.477862+05');
INSERT INTO public.quotation_approval_logs OVERRIDING SYSTEM VALUE VALUES (6, 11, 'Approved', 'WhatsApp', 'Naveed', '2026-10-31 11:11:52.73772+05', '', '2026-10-31 11:11:52.73772+05');
INSERT INTO public.quotation_approval_logs OVERRIDING SYSTEM VALUE VALUES (7, 11, 'Revision Requested', 'WhatsApp', 'Naveed', '2026-10-31 11:24:37.363802+05', '', '2026-10-31 11:24:37.363802+05');
INSERT INTO public.quotation_approval_logs OVERRIDING SYSTEM VALUE VALUES (8, 9, 'Approved', 'WhatsApp', 'Usman Tariq', '2026-10-31 11:24:55.443729+05', '', '2026-10-31 11:24:55.443729+05');


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (3, 1, 1, 'Printing', 'Corporate Brochures (Updated)', NULL, 'A4 Folded', 'Art Card', '300 GSM', '4/4 Full Color', 'Matte Lamination + Spot UV', 3000.000, 'pcs', 55.00, 165000.00, NULL, NULL, NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (6, 2, 1, 'Printing', 'Corporate Brochures (Updated)', '', 'A4 Folded', 'Art Card', '300 GSM', '4/4 Full Color', 'Matte Lamination + Spot UV', 3000.000, 'pcs', 55.00, 165000.00, '', NULL, NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (10, 3, 1, 'Printing', 'flyers', '', 'a5', 'art paper', '128', '4', 'no', 1000.000, '1000', 5.50, 5500.00, '', NULL, NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (11, 4, 1, 'Service', 'Crown Corporate Portal Development', NULL, NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 110000.00, 110000.00, 'Includes 1 year domain & cloud hosting', 'Website Development', '{
    "startDate":  "2026-11-01",
    "websiteType":  "Corporate",
    "maintenanceBillingPeriod":  "Monthly",
    "designType":  "Custom UI",
    "domainHostingCharges":  20000,
    "estimatedCompletion":  "4 Weeks",
    "figmaUiUx":  true,
    "standardPages":  [
                          "Home",
                          "About",
                          "Services",
                          "Products",
                          "Contact",
                          "Blog"
                      ],
    "maintenanceFee":  15000,
    "additionalFeatureCharges":  0,
    "deliveryMilestones":  "M1: UI Mockups -\u003e M2: Backend API -\u003e M3: QA \u0026 Launch",
    "technology":  "Angular + .NET",
    "hostingSeo":  [
                       "Domain Registration",
                       "Cloud Hosting",
                       "SSL Certificate",
                       "Basic On-Page SEO",
                       "Google Analytics"
                   ],
    "websiteDevFee":  90000,
    "responsiveDesign":  true,
    "additionalPageCharges":  0,
    "features":  [
                     "Contact Form",
                     "WhatsApp Integration",
                     "AI Chatbot",
                     "CMS",
                     "Admin Dashboard"
                 ],
    "projectDescription":  "Enterprise corporate web application with client portal",
    "projectName":  "Crown Corporate Portal",
    "projectNature":  "New Website",
    "numberOfPages":  6,
    "designRevisions":  "2 Rounds"
}', 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (12, 4, 2, 'Service', 'On-Page & Technical SEO Setup', NULL, NULL, NULL, NULL, NULL, NULL, 1.000, 'service', 25000.00, 25000.00, 'Keyword research, meta tags, schema markup', 'SEO Services', NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (13, 5, 1, 'Service', 'Crown Corporate Portal Development', NULL, NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 110000.00, 110000.00, 'Includes 1 year domain & cloud hosting', 'Website Development', '{
    "startDate":  "2026-11-01",
    "websiteType":  "Corporate",
    "maintenanceBillingPeriod":  "Monthly",
    "designType":  "Custom UI",
    "domainHostingCharges":  20000,
    "estimatedCompletion":  "4 Weeks",
    "figmaUiUx":  true,
    "standardPages":  [
                          "Home",
                          "About",
                          "Services",
                          "Products",
                          "Contact",
                          "Blog"
                      ],
    "maintenanceFee":  15000,
    "additionalFeatureCharges":  0,
    "deliveryMilestones":  "M1: UI Mockups -\u003e M2: Backend API -\u003e M3: QA \u0026 Launch",
    "technology":  "Angular + .NET",
    "hostingSeo":  [
                       "Domain Registration",
                       "Cloud Hosting",
                       "SSL Certificate",
                       "Basic On-Page SEO",
                       "Google Analytics"
                   ],
    "websiteDevFee":  90000,
    "responsiveDesign":  true,
    "additionalPageCharges":  0,
    "features":  [
                     "Contact Form",
                     "WhatsApp Integration",
                     "AI Chatbot",
                     "CMS",
                     "Admin Dashboard"
                 ],
    "projectDescription":  "Enterprise corporate web application with client portal",
    "projectName":  "Crown Corporate Portal",
    "projectNature":  "New Website",
    "numberOfPages":  6,
    "designRevisions":  "2 Rounds"
}', 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (14, 5, 2, 'Service', 'On-Page & Technical SEO Setup', NULL, NULL, NULL, NULL, NULL, NULL, 1.000, 'service', 25000.00, 25000.00, 'Keyword research, meta tags, schema markup', 'SEO Services', NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (15, 6, 1, 'Service', 'Corporate Website Development', '5-page responsive business website with contact form and SEO setup', NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 85000.00, 85000.00, 'Includes 1 year maintenance', 'Website Development', NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (16, 6, 2, 'Service', 'SEO Services', 'Complete on-page optimization, Google Search Console, and meta tags', NULL, NULL, NULL, NULL, NULL, 1.000, 'service', 25000.00, 25000.00, NULL, 'SEO Services', NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (17, 7, 1, 'Service', 'Custom Corporate Website', 'Custom Angular & .NET portal with WhatsApp integration', NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 75000.00, 75000.00, NULL, 'Website', '{"pagesCount":8}', 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (18, 7, 2, 'Service', 'Monthly Growth Marketing', 'Complete monthly digital marketing management', NULL, NULL, NULL, NULL, NULL, 1.000, 'month', 85000.00, 85000.00, NULL, 'Marketing', '{"seo":"Full SEO Audit \u0026 Optimization","videoCount":8,"postsCount":20,"ads":"Meta \u0026 TikTok Ads Campaign"}', 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (19, 8, 1, 'Service', 'Custom Corporate Website', 'Custom Angular & .NET portal with WhatsApp integration', NULL, NULL, NULL, NULL, NULL, 1.000, 'project', 75000.00, 75000.00, NULL, 'Website', '{"pagesCount":8}', 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (20, 8, 2, 'Service', 'Monthly Growth Marketing', 'Monthly marketing posts and reels management', NULL, NULL, NULL, NULL, NULL, 1.000, 'month', 85000.00, 85000.00, NULL, 'Marketing', '{"postsCount":20,"videoCount":8}', 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (22, 10, 1, 'Service', 'Digital Marketing Campaign', '', NULL, NULL, NULL, NULL, NULL, 10.000, 'month', 110.00, 1100.00, '', 'Marketing', '{"postsCount":12,"videoCount":4}', 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (26, 11, 1, 'Service', 'Digital Marketing Campaign', '', NULL, NULL, NULL, NULL, NULL, 10.000, 'month', 110.00, 1100.00, '', 'Marketing', '{"postsCount":12,"videoCount":4}', 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (27, 11, 2, 'Service', 'Hammed Latif website', '', NULL, NULL, NULL, NULL, NULL, 1.000, 'pcs', 100023.00, 100023.00, '', 'Website', '{"pagesCount":19}', 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (32, 9, 1, 'Printing', 'Digital Marketing Campaign', '', '', '', '', '', '', 1.000, 'pcs', 90000.00, 90000.00, '', NULL, NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (34, 12, 1, 'Printing', 'Digital Marketing Campaign', '', '', '', '', '', '', 1.000, 'pcs', 90000.00, 90000.00, '', NULL, NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (37, 13, 1, 'Printing', 'Digital Marketing Campaign', '', '', '', '', '', '', 1.000, 'pcs', 90000.00, 90000.00, '', NULL, NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (39, 15, 1, 'Service', 'Digital Marketing Campaign', '', NULL, NULL, NULL, NULL, NULL, 1.000, '12', 10000.00, 10000.00, '', 'Marketing', '{"postsCount":12,"videoCount":4}', 'OUTSOURCED');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (41, 14, 1, 'Printing', 'Outsourced Banners', '', '', '', '', '', '', 100.000, 'pcs', 500.00, 50000.00, '', NULL, NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (42, 16, 1, 'Printing', 'Outsourced Banners', '', '', '', '', '', '', 100.000, 'pcs', 500.00, 50000.00, '', NULL, NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (43, 17, 1, 'Printing', 'Standard Business Card Single Side with 4 Color', 'Business Card - Single, 4 Color. (Ref: EST-20261103-0001)', '25 x 36', 'ART CARD', 'Standard', '4 Color', NULL, 1000.000, 'pcs', 4.82, 4818.00, 'Transferred from Job Costing Estimate EST-20261103-0001 for qty 1000.', NULL, NULL, 'IN_HOUSE');
INSERT INTO public.quotation_items OVERRIDING SYSTEM VALUE VALUES (44, 18, 1, 'Printing', 'Standard Printing Job', 'Front Side side, 4 Color. Finished size: 11.69×16.54 in. Material: ART CARD 300 GSM (25×36).', '25 × 36', 'ART CARD', '300', '4 Color', NULL, 1000.000, 'pcs', 31.94, 31940.00, 'Generated from Printing Intelligence Estimate EST-20261105-6943', 'PRINTING', '{"estimateId":1,"estimateNumber":"EST-20261105-6943","quantity":1000,"materialCost":1215.0000,"additionalExpenses":2900.0000,"productionCost":4115.0000,"profitAmount":823.0000,"taxAmount":0.0000,"grandTotal":4938.0000,"perPiecePrice":4.9400,"items":[{"name":"Positive / Tracing","amount":0.0000},{"name":"Plates","amount":900.0000},{"name":"Printing","amount":1000.0000},{"name":"Lamination","amount":700.0000},{"name":"Die Making","amount":0.0000},{"name":"Die Cutting","amount":0.0000},{"name":"Binding","amount":0.0000},{"name":"Packing","amount":0.0000},{"name":"Petrol \u002B Misc.","amount":300.0000}]}', 'IN_HOUSE');


--
-- Data for Name: quotation_revisions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (1, 1, 1, 'Finalized', '2026-10-30 05:00:00+05', '2026-11-14 05:00:00+05', 165000.00, 'Percentage', 10.00, 16500.00, 16.0000, 23760.00, 172260.00, NULL, NULL, NULL, '2026-10-30 16:46:16.480393+05', '2026-10-30 15:17:18.762127+05', '2026-10-30 16:46:16.480393+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (2, 1, 2, 'Draft', '2026-10-30 05:00:00+05', '2026-11-14 05:00:00+05', 165000.00, 'Percentage', 1.00, 1650.00, 16.0000, 26136.00, 189486.00, '', '', '', NULL, '2026-10-30 16:46:25.811539+05', '2026-10-30 17:00:45.130176+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (12, 8, 2, 'Finalized', '2026-11-02 05:00:00+05', '2026-11-17 05:00:00+05', 90000.00, 'None', 0.00, 0.00, 0.0000, 0.00, 90000.00, '', '', '50 persent advance', '2026-11-02 16:26:45.372041+05', '2026-11-02 15:59:14.577387+05', '2026-11-02 16:26:45.372041+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (3, 2, 1, 'Draft', '2026-10-30 05:00:00+05', '2026-11-21 05:00:00+05', 5500.00, 'Fixed', 1000.00, 1000.00, 5.5000, 247.50, 4747.50, '', 'digital print krwa kr deny hain', '1. 50% advance payment required upon order confirmation.
2. Delivery timeline starts after sample / artwork approval.
3. Quotation is valid for 15 days from issue date.', NULL, '2026-10-30 17:10:57.462073+05', '2026-10-30 17:56:30.674496+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (4, 3, 1, 'Finalized', '2026-10-31 09:56:34.459626+05', '2026-11-15 09:56:34.459626+05', 135000.00, 'Percentage', 5.00, 6750.00, 0.0000, 0.00, 128250.00, NULL, NULL, NULL, '2026-10-31 09:56:35.235317+05', '2026-10-31 09:56:34.459626+05', '2026-10-31 09:56:35.235317+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (5, 4, 1, 'Finalized', '2026-10-31 09:57:40.650763+05', '2026-11-15 09:57:40.650763+05', 135000.00, 'Percentage', 5.00, 6750.00, 0.0000, 0.00, 128250.00, NULL, NULL, NULL, '2026-10-31 09:57:40.693086+05', '2026-10-31 09:57:40.650763+05', '2026-10-31 09:57:40.693086+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (6, 5, 1, 'Finalized', '2026-10-31 10:08:48.506557+05', '2026-11-15 10:08:48.506557+05', 110000.00, 'Fixed', 5000.00, 5000.00, 0.0000, 0.00, 105000.00, NULL, NULL, NULL, '2026-10-31 10:08:49.288668+05', '2026-10-31 10:08:48.506557+05', '2026-10-31 10:08:49.288668+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (7, 6, 1, 'Finalized', '2026-10-31 05:00:00+05', '2026-11-15 05:00:00+05', 160000.00, 'Percentage', 5.00, 8000.00, 0.0000, 0.00, 152000.00, 'Internal developer costs verified', 'Complete digital presence package', '1. 50% advance.\n2. Delivery within 3 weeks.', '2026-10-31 10:28:45.13794+05', '2026-10-31 10:28:44.375761+05', '2026-10-31 10:28:45.13794+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (8, 7, 1, 'Finalized', '2026-10-31 05:00:00+05', '2026-11-15 05:00:00+05', 160000.00, 'Percentage', 5.00, 8000.00, 0.0000, 0.00, 152000.00, 'Internal developer costs verified', 'Complete digital presence package', '1. 50% advance.\n2. Delivery within 3 weeks.', '2026-10-31 10:34:53.645731+05', '2026-10-31 10:34:53.116536+05', '2026-10-31 10:34:53.645731+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (10, 9, 1, 'Finalized', '2026-10-31 05:00:00+05', '2026-11-15 05:00:00+05', 1100.00, 'None', 0.00, 0.00, 0.0000, 0.00, 1100.00, '', '', '1. 50% advance payment required upon order confirmation.
2. Delivery timeline starts after sample / artwork approval.
3. Quotation is valid for 15 days from issue date.', '2026-10-31 11:01:19.126161+05', '2026-10-31 11:01:19.05802+05', '2026-10-31 11:01:19.126161+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (11, 9, 2, 'Finalized', '2026-10-31 05:00:00+05', '2026-11-15 05:00:00+05', 101123.00, 'Fixed', 20000.00, 20000.00, 8.0000, 6489.84, 87612.84, '', '', '1. 50% advance payment required upon order confirmation.
2. Delivery timeline starts after sample / artwork approval.
3. Quotation is valid for 15 days from issue date.', '2026-10-31 11:23:58.921215+05', '2026-10-31 11:08:47.729652+05', '2026-10-31 11:23:58.921215+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (13, 8, 3, 'Draft', '2026-11-02 05:00:00+05', '2026-11-17 05:00:00+05', 90000.00, 'None', 0.00, 0.00, 0.0000, 0.00, 90000.00, '', '', '50 persent advance', NULL, '2026-11-02 16:26:50.736047+05', '2026-11-02 16:47:58.467601+05', 'OUTSOURCED');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (15, 11, 1, 'Finalized', '2026-11-02 05:00:00+05', '2026-11-17 05:00:00+05', 10000.00, 'Percentage', 5.00, 500.00, 18.0000, 1710.00, 11210.00, '', '', '1. 50% advance payment required upon order confirmation.
2. Delivery timeline starts after sample / artwork approval.
3. Quotation is valid for 15 days from issue date.', '2026-11-02 17:42:11.682628+05', '2026-11-02 17:42:06.275499+05', '2026-11-02 17:42:11.682628+05', 'OUTSOURCED');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (9, 8, 1, 'Finalized', '2026-10-31 05:00:00+05', '2026-11-15 05:00:00+05', 90000.00, 'None', 0.00, 0.00, 0.0000, 0.00, 90000.00, '', '', '50 persent advance', '2026-11-02 15:59:05.555964+05', '2026-10-31 10:49:06.863483+05', '2026-11-02 15:59:05.555964+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (14, 10, 1, 'Finalized', '2026-11-02 05:00:00+05', '2026-11-17 05:00:00+05', 50000.00, 'None', 0.00, 0.00, 0.0000, 0.00, 50000.00, '', '', '', '2026-11-03 10:15:28.284277+05', '2026-11-02 16:40:12.13266+05', '2026-11-03 10:15:28.284277+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (16, 10, 2, 'Finalized', '2026-11-03 10:15:41.30549+05', '2026-11-18 10:15:41.30549+05', 50000.00, 'None', 0.00, 0.00, 0.0000, 0.00, 50000.00, '', '', '', '2026-11-03 10:15:45.050548+05', '2026-11-03 10:15:41.30549+05', '2026-11-03 10:15:45.050548+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (17, 12, 1, 'Draft', '2026-11-03 17:40:19.939638+05', '2026-11-17 17:40:19.939666+05', 4818.00, 'None', 0.00, 0.00, 0.0000, 0.00, 4818.00, NULL, NULL, NULL, NULL, '2026-11-03 17:40:19.939691+05', '2026-11-03 17:40:19.939455+05', 'IN_HOUSE');
INSERT INTO public.quotation_revisions OVERRIDING SYSTEM VALUE VALUES (18, 13, 1, 'Draft', '2026-11-05 10:37:09.866825+05', '2026-11-19 10:37:09.866885+05', 31940.00, 'None', 0.00, 0.00, 0.0000, 0.00, 31940.00, NULL, NULL, NULL, NULL, '2026-11-05 10:37:09.867183+05', '2026-11-05 10:37:09.867235+05', 'IN_HOUSE');


--
-- Data for Name: quotation_send_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.quotation_send_logs OVERRIDING SYSTEM VALUE VALUES (1, 1, 'WhatsApp', '+92 300 1234567', '2026-10-30 15:27:20.624409+05', 'Shared PDF via WhatsApp Web', '2026-10-30 15:27:20.624409+05');


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (1, 'QT-20261030-0001', NULL, 'Crown Group', 'Naveed Ahmad', '+92 300 8888888', 'naveed@crowngroup.pk', 'Industrial Area, Lahore', 'Printing', 'PKR', '2026-10-30 15:17:18.762127+05', '2026-10-30 17:00:45.130176+05', NULL);
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (8, 'QT-20261031-0006', 6, 'Auto Tech Corp 48148', 'Usman Tariq', '+92 345 48148', 'usman@autotech48148.pk', 'Gulberg III, Lahore', 'Printing', 'PKR', '2026-10-31 10:49:06.863483+05', '2026-11-02 16:47:58.467601+05', NULL);
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (2, 'QT-20261030-0002', 1, 'Alpha Graphics Ltd', 'Bilal Khan', '03218401998', 'bilal@alphagraphics.pk', 'Main Boulevard, Gulberg, Lahore2', 'Printing', 'PKR', '2026-10-30 17:10:57.462073+05', '2026-10-30 17:56:30.674496+05', NULL);
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (11, 'QT-20261102-0002', 9, 'Systems', 'Umair', '03134565030', 'ranaumairofficial2@gmail.com', 'Near Lahore', 'Digital Marketing', 'PKR', '2026-11-02 17:42:06.275499+05', '2026-11-02 17:42:11.682628+05', NULL);
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (7, 'QT-20261031-0005', NULL, 'Crown Digital Solutions', 'Naveed Ahmad', '+92 300 9876543', 'naveed@crowndigital.pk', 'Phase 5, DHA, Lahore', 'Digital Marketing', 'PKR', '2026-10-31 10:34:53.116536+05', '2026-10-31 10:36:06.494496+05', '2026-10-31 10:36:06.494443+05');
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (6, 'QT-20261031-0004', NULL, 'Crown Digital Solutions', 'Naveed Ahmad', '+92 300 9876543', 'naveed@crowndigital.pk', 'Phase 5, DHA, Lahore', 'Digital Marketing', 'PKR', '2026-10-31 10:28:44.375761+05', '2026-10-31 11:09:07.352143+05', '2026-10-31 11:09:07.352069+05');
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (5, 'QT-20261031-0003', NULL, 'Crown Digital Solutions', 'Mr. Hamza Tariq', '0300-8889999', 'hamza@crowndigital.pk', NULL, 'Digital Marketing', 'PKR', '2026-10-31 10:08:48.506557+05', '2026-10-31 11:09:11.515448+05', '2026-10-31 11:09:11.515448+05');
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (4, 'QT-20261031-0002', NULL, 'Crown Digital Solutions', 'Mr. Hamza Tariq', '0300-8889999', 'hamza@crowndigital.pk', NULL, 'Digital Marketing', 'PKR', '2026-10-31 09:57:40.650763+05', '2026-10-31 11:09:17.028312+05', '2026-10-31 11:09:17.028312+05');
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (3, 'QT-20261031-0001', NULL, 'Crown Digital Solutions', 'Mr. Hamza Tariq', '0300-8889999', 'hamza@crowndigital.pk', NULL, 'Digital Marketing', 'PKR', '2026-10-31 09:56:34.459626+05', '2026-10-31 11:09:28.754172+05', '2026-10-31 11:09:28.754172+05');
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (10, 'QT-20261102-0001', 8, 'Vendor Test Client', '', '+92 300 1234567', '', '', 'Printing', 'PKR', '2026-11-02 16:40:12.13266+05', '2026-11-03 10:15:45.050548+05', NULL);
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (12, 'QT-20261103-0001', 4, 'Zero Pixel', 'Naveed(SEO)', '031323040302', 'zeropixel@gmail.com', 'Lahore', 'Printing', 'PKR', '2026-11-03 17:40:19.883715+05', '2026-11-03 17:40:19.883751+05', NULL);
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (13, 'QTE-20261105-6984', NULL, 'Walk-in Customer', NULL, '0300-0000000', NULL, NULL, 'Printing', 'PKR', '2026-11-05 10:37:09.866105+05', '2026-11-05 10:37:09.86616+05', NULL);
INSERT INTO public.quotations OVERRIDING SYSTEM VALUE VALUES (9, 'QT-20261031-0007', 7, 'ZeroPixel', 'Naveed', '03134565031', 'ur1988228@gmail.com', 'Street No 9 House No 6', 'Digital Marketing', 'PKR', '2026-10-31 11:01:19.05802+05', '2026-10-31 11:24:50.45136+05', '2026-10-31 11:24:50.45119+05');


--
-- Name: admin_users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_users_user_id_seq', 1, true);


--
-- Name: clients_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clients_client_id_seq', 11, true);


--
-- Name: cost_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cost_categories_category_id_seq', 10, true);


--
-- Name: estimate_cost_items_cost_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estimate_cost_items_cost_item_id_seq', 72, true);


--
-- Name: estimate_quantities_estimate_quantity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estimate_quantities_estimate_quantity_id_seq', 8, true);


--
-- Name: estimate_results_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estimate_results_result_id_seq', 8, true);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 16, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invoices_id_seq', 8, true);


--
-- Name: paper_sizes_paper_size_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.paper_sizes_paper_size_id_seq', 19, true);


--
-- Name: printing_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.printing_categories_category_id_seq', 12, true);


--
-- Name: printing_cost_estimates_estimate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.printing_cost_estimates_estimate_id_seq', 2, true);


--
-- Name: printing_item_sizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.printing_item_sizes_id_seq', 195, true);


--
-- Name: printing_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.printing_items_item_id_seq', 195, true);


--
-- Name: printing_machine_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.printing_machine_rates_id_seq', 4, true);


--
-- Name: printing_materials_material_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.printing_materials_material_id_seq', 8, true);


--
-- Name: printing_order_items_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.printing_order_items_order_item_id_seq', 26, true);


--
-- Name: printing_orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.printing_orders_order_id_seq', 16, true);


--
-- Name: printing_sizes_size_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.printing_sizes_size_id_seq', 59, true);


--
-- Name: production_job_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.production_job_items_id_seq', 38, true);


--
-- Name: production_job_sheets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.production_job_sheets_id_seq', 3, true);


--
-- Name: production_jobs_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.production_jobs_job_id_seq', 17, true);


--
-- Name: quotation_approval_logs_approval_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotation_approval_logs_approval_id_seq', 8, true);


--
-- Name: quotation_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotation_items_item_id_seq', 44, true);


--
-- Name: quotation_revisions_revision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotation_revisions_revision_id_seq', 18, true);


--
-- Name: quotation_send_logs_send_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotation_send_logs_send_id_seq', 1, true);


--
-- Name: quotations_quotation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotations_quotation_id_seq', 13, true);


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: admin_users PK_admin_users; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT "PK_admin_users" PRIMARY KEY (user_id);


--
-- Name: clients PK_clients; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT "PK_clients" PRIMARY KEY (client_id);


--
-- Name: quotation_approval_logs PK_quotation_approval_logs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_approval_logs
    ADD CONSTRAINT "PK_quotation_approval_logs" PRIMARY KEY (approval_id);


--
-- Name: quotation_items PK_quotation_items; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT "PK_quotation_items" PRIMARY KEY (item_id);


--
-- Name: quotation_revisions PK_quotation_revisions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_revisions
    ADD CONSTRAINT "PK_quotation_revisions" PRIMARY KEY (revision_id);


--
-- Name: quotation_send_logs PK_quotation_send_logs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_send_logs
    ADD CONSTRAINT "PK_quotation_send_logs" PRIMARY KEY (send_id);


--
-- Name: quotations PK_quotations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "PK_quotations" PRIMARY KEY (quotation_id);


--
-- Name: cost_categories cost_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_categories
    ADD CONSTRAINT cost_categories_pkey PRIMARY KEY (category_id);


--
-- Name: estimate_cost_items estimate_cost_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimate_cost_items
    ADD CONSTRAINT estimate_cost_items_pkey PRIMARY KEY (cost_item_id);


--
-- Name: estimate_quantities estimate_quantities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimate_quantities
    ADD CONSTRAINT estimate_quantities_pkey PRIMARY KEY (estimate_quantity_id);


--
-- Name: estimate_results estimate_results_estimate_quantity_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimate_results
    ADD CONSTRAINT estimate_results_estimate_quantity_id_key UNIQUE (estimate_quantity_id);


--
-- Name: estimate_results estimate_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimate_results
    ADD CONSTRAINT estimate_results_pkey PRIMARY KEY (result_id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: paper_sizes paper_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paper_sizes
    ADD CONSTRAINT paper_sizes_pkey PRIMARY KEY (paper_size_id);


--
-- Name: paper_sizes paper_sizes_size_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paper_sizes
    ADD CONSTRAINT paper_sizes_size_name_key UNIQUE (size_name);


--
-- Name: printing_categories printing_categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_categories
    ADD CONSTRAINT printing_categories_category_name_key UNIQUE (category_name);


--
-- Name: printing_categories printing_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_categories
    ADD CONSTRAINT printing_categories_pkey PRIMARY KEY (category_id);


--
-- Name: printing_cost_estimates printing_cost_estimates_estimate_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_cost_estimates
    ADD CONSTRAINT printing_cost_estimates_estimate_number_key UNIQUE (estimate_number);


--
-- Name: printing_cost_estimates printing_cost_estimates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_cost_estimates
    ADD CONSTRAINT printing_cost_estimates_pkey PRIMARY KEY (estimate_id);


--
-- Name: printing_item_sizes printing_item_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_item_sizes
    ADD CONSTRAINT printing_item_sizes_pkey PRIMARY KEY (id);


--
-- Name: printing_items printing_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_items
    ADD CONSTRAINT printing_items_pkey PRIMARY KEY (item_id);


--
-- Name: printing_machine_rates printing_machine_rates_machine_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_machine_rates
    ADD CONSTRAINT printing_machine_rates_machine_name_key UNIQUE (machine_name);


--
-- Name: printing_machine_rates printing_machine_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_machine_rates
    ADD CONSTRAINT printing_machine_rates_pkey PRIMARY KEY (id);


--
-- Name: printing_materials printing_materials_material_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_materials
    ADD CONSTRAINT printing_materials_material_name_key UNIQUE (material_name);


--
-- Name: printing_materials printing_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_materials
    ADD CONSTRAINT printing_materials_pkey PRIMARY KEY (material_id);


--
-- Name: printing_order_items printing_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_order_items
    ADD CONSTRAINT printing_order_items_pkey PRIMARY KEY (order_item_id);


--
-- Name: printing_orders printing_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_orders
    ADD CONSTRAINT printing_orders_order_number_key UNIQUE (order_number);


--
-- Name: printing_orders printing_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_orders
    ADD CONSTRAINT printing_orders_pkey PRIMARY KEY (order_id);


--
-- Name: printing_orders printing_orders_revision_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_orders
    ADD CONSTRAINT printing_orders_revision_id_key UNIQUE (revision_id);


--
-- Name: printing_sizes printing_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_sizes
    ADD CONSTRAINT printing_sizes_pkey PRIMARY KEY (size_id);


--
-- Name: printing_sizes printing_sizes_size_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_sizes
    ADD CONSTRAINT printing_sizes_size_name_key UNIQUE (size_name);


--
-- Name: production_job_items production_job_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_job_items
    ADD CONSTRAINT production_job_items_pkey PRIMARY KEY (id);


--
-- Name: production_job_sheets production_job_sheets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_job_sheets
    ADD CONSTRAINT production_job_sheets_pkey PRIMARY KEY (id);


--
-- Name: production_jobs production_jobs_job_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_jobs
    ADD CONSTRAINT production_jobs_job_number_key UNIQUE (job_number);


--
-- Name: production_jobs production_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_jobs
    ADD CONSTRAINT production_jobs_pkey PRIMARY KEY (job_id);


--
-- Name: production_job_items uq_job_order_item; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_job_items
    ADD CONSTRAINT uq_job_order_item UNIQUE (job_id, order_item_id);


--
-- Name: printing_item_sizes uq_printing_item_size; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_item_sizes
    ADD CONSTRAINT uq_printing_item_size UNIQUE (printing_item_id, size_id);


--
-- Name: production_jobs uq_production_jobs_order_prod_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_jobs
    ADD CONSTRAINT uq_production_jobs_order_prod_type UNIQUE (order_id, production_type);


--
-- Name: IX_admin_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_admin_users_email" ON public.admin_users USING btree (email);


--
-- Name: IX_clients_company_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_clients_company_name" ON public.clients USING btree (company_name);


--
-- Name: IX_clients_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_clients_deleted_at" ON public.clients USING btree (deleted_at);


--
-- Name: IX_clients_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_clients_is_active" ON public.clients USING btree (is_active);


--
-- Name: IX_clients_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_clients_phone" ON public.clients USING btree (phone);


--
-- Name: IX_quotation_approval_logs_revision_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_quotation_approval_logs_revision_id" ON public.quotation_approval_logs USING btree (revision_id);


--
-- Name: IX_quotation_items_revision_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_quotation_items_revision_id" ON public.quotation_items USING btree (revision_id);


--
-- Name: IX_quotation_revisions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_quotation_revisions_date" ON public.quotation_revisions USING btree (quotation_date);


--
-- Name: IX_quotation_revisions_quotation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_quotation_revisions_quotation_id" ON public.quotation_revisions USING btree (quotation_id);


--
-- Name: IX_quotation_revisions_quote_rev; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_quotation_revisions_quote_rev" ON public.quotation_revisions USING btree (quotation_id, revision_number);


--
-- Name: IX_quotation_revisions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_quotation_revisions_status" ON public.quotation_revisions USING btree (status);


--
-- Name: IX_quotation_send_logs_revision_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_quotation_send_logs_revision_id" ON public.quotation_send_logs USING btree (revision_id);


--
-- Name: IX_quotations_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_quotations_client_id" ON public.quotations USING btree (client_id);


--
-- Name: IX_quotations_customer_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_quotations_customer_name" ON public.quotations USING btree (customer_name);


--
-- Name: IX_quotations_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_quotations_deleted_at" ON public.quotations USING btree (deleted_at);


--
-- Name: IX_quotations_quotation_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_quotations_quotation_number" ON public.quotations USING btree (quotation_number);


--
-- Name: ix_estimate_cost_items_quantity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_estimate_cost_items_quantity_id ON public.estimate_cost_items USING btree (estimate_quantity_id);


--
-- Name: ix_estimate_quantities_estimate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_estimate_quantities_estimate_id ON public.estimate_quantities USING btree (estimate_id);


--
-- Name: ix_invoice_items_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_invoice_items_invoice_id ON public.invoice_items USING btree (invoice_id);


--
-- Name: ix_invoices_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_invoices_customer_id ON public.invoices USING btree (customer_id);


--
-- Name: ix_invoices_invoice_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_invoices_invoice_date ON public.invoices USING btree (invoice_date);


--
-- Name: ix_invoices_invoice_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_invoices_invoice_number ON public.invoices USING btree (invoice_number);


--
-- Name: ix_paper_sizes_size_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_paper_sizes_size_name ON public.paper_sizes USING btree (size_name);


--
-- Name: ix_printing_categories_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_printing_categories_name ON public.printing_categories USING btree (category_name);


--
-- Name: ix_printing_cost_estimates_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_printing_cost_estimates_category ON public.printing_cost_estimates USING btree (printing_category_id);


--
-- Name: ix_printing_cost_estimates_estimate_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_printing_cost_estimates_estimate_number ON public.printing_cost_estimates USING btree (estimate_number);


--
-- Name: ix_printing_cost_estimates_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_printing_cost_estimates_item ON public.printing_cost_estimates USING btree (printing_item_id);


--
-- Name: ix_printing_item_sizes_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_printing_item_sizes_item ON public.printing_item_sizes USING btree (printing_item_id);


--
-- Name: ix_printing_item_sizes_size; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_printing_item_sizes_size ON public.printing_item_sizes USING btree (size_id);


--
-- Name: ix_printing_items_category_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_printing_items_category_name ON public.printing_items USING btree (category_id, item_name);


--
-- Name: ix_printing_materials_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_printing_materials_name ON public.printing_materials USING btree (material_name);


--
-- Name: ix_printing_orders_quotation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_printing_orders_quotation_id ON public.printing_orders USING btree (quotation_id);


--
-- Name: ix_printing_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_printing_orders_status ON public.printing_orders USING btree (status);


--
-- Name: ix_printing_sizes_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_printing_sizes_name ON public.printing_sizes USING btree (size_name);


--
-- Name: ix_printing_sizes_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_printing_sizes_order ON public.printing_sizes USING btree (display_order);


--
-- Name: ix_production_job_sheets_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_production_job_sheets_created_at ON public.production_job_sheets USING btree (created_at);


--
-- Name: ix_production_job_sheets_customer_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_production_job_sheets_customer_name ON public.production_job_sheets USING btree (customer_name);


--
-- Name: ix_production_job_sheets_job_card_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_production_job_sheets_job_card_number ON public.production_job_sheets USING btree (job_card_number);


--
-- Name: ix_production_jobs_production_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_production_jobs_production_type ON public.production_jobs USING btree (production_type);


--
-- Name: ix_production_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_production_jobs_status ON public.production_jobs USING btree (status);


--
-- Name: quotation_approval_logs FK_quotation_approval_logs_quotation_revisions_revision_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_approval_logs
    ADD CONSTRAINT "FK_quotation_approval_logs_quotation_revisions_revision_id" FOREIGN KEY (revision_id) REFERENCES public.quotation_revisions(revision_id) ON DELETE CASCADE;


--
-- Name: quotation_items FK_quotation_items_quotation_revisions_revision_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT "FK_quotation_items_quotation_revisions_revision_id" FOREIGN KEY (revision_id) REFERENCES public.quotation_revisions(revision_id) ON DELETE CASCADE;


--
-- Name: quotation_revisions FK_quotation_revisions_quotations_quotation_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_revisions
    ADD CONSTRAINT "FK_quotation_revisions_quotations_quotation_id" FOREIGN KEY (quotation_id) REFERENCES public.quotations(quotation_id) ON DELETE CASCADE;


--
-- Name: quotation_send_logs FK_quotation_send_logs_quotation_revisions_revision_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_send_logs
    ADD CONSTRAINT "FK_quotation_send_logs_quotation_revisions_revision_id" FOREIGN KEY (revision_id) REFERENCES public.quotation_revisions(revision_id) ON DELETE CASCADE;


--
-- Name: estimate_cost_items estimate_cost_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimate_cost_items
    ADD CONSTRAINT estimate_cost_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.cost_categories(category_id) ON DELETE SET NULL;


--
-- Name: estimate_cost_items estimate_cost_items_estimate_quantity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimate_cost_items
    ADD CONSTRAINT estimate_cost_items_estimate_quantity_id_fkey FOREIGN KEY (estimate_quantity_id) REFERENCES public.estimate_quantities(estimate_quantity_id) ON DELETE CASCADE;


--
-- Name: estimate_quantities estimate_quantities_estimate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimate_quantities
    ADD CONSTRAINT estimate_quantities_estimate_id_fkey FOREIGN KEY (estimate_id) REFERENCES public.printing_cost_estimates(estimate_id) ON DELETE CASCADE;


--
-- Name: estimate_results estimate_results_estimate_quantity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estimate_results
    ADD CONSTRAINT estimate_results_estimate_quantity_id_fkey FOREIGN KEY (estimate_quantity_id) REFERENCES public.estimate_quantities(estimate_quantity_id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.clients(client_id) ON DELETE RESTRICT;


--
-- Name: printing_cost_estimates printing_cost_estimates_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_cost_estimates
    ADD CONSTRAINT printing_cost_estimates_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.printing_materials(material_id) ON DELETE SET NULL;


--
-- Name: printing_cost_estimates printing_cost_estimates_paper_size_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_cost_estimates
    ADD CONSTRAINT printing_cost_estimates_paper_size_id_fkey FOREIGN KEY (paper_size_id) REFERENCES public.paper_sizes(paper_size_id) ON DELETE SET NULL;


--
-- Name: printing_cost_estimates printing_cost_estimates_printing_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_cost_estimates
    ADD CONSTRAINT printing_cost_estimates_printing_category_id_fkey FOREIGN KEY (printing_category_id) REFERENCES public.printing_categories(category_id) ON DELETE SET NULL;


--
-- Name: printing_cost_estimates printing_cost_estimates_printing_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_cost_estimates
    ADD CONSTRAINT printing_cost_estimates_printing_item_id_fkey FOREIGN KEY (printing_item_id) REFERENCES public.printing_items(item_id) ON DELETE SET NULL;


--
-- Name: printing_item_sizes printing_item_sizes_printing_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_item_sizes
    ADD CONSTRAINT printing_item_sizes_printing_item_id_fkey FOREIGN KEY (printing_item_id) REFERENCES public.printing_items(item_id) ON DELETE CASCADE;


--
-- Name: printing_item_sizes printing_item_sizes_size_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_item_sizes
    ADD CONSTRAINT printing_item_sizes_size_id_fkey FOREIGN KEY (size_id) REFERENCES public.printing_sizes(size_id) ON DELETE CASCADE;


--
-- Name: printing_items printing_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_items
    ADD CONSTRAINT printing_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.printing_categories(category_id) ON DELETE RESTRICT;


--
-- Name: printing_order_items printing_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_order_items
    ADD CONSTRAINT printing_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.printing_orders(order_id) ON DELETE CASCADE;


--
-- Name: printing_orders printing_orders_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_orders
    ADD CONSTRAINT printing_orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(client_id) ON DELETE SET NULL;


--
-- Name: printing_orders printing_orders_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_orders
    ADD CONSTRAINT printing_orders_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(quotation_id) ON DELETE CASCADE;


--
-- Name: printing_orders printing_orders_revision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printing_orders
    ADD CONSTRAINT printing_orders_revision_id_fkey FOREIGN KEY (revision_id) REFERENCES public.quotation_revisions(revision_id) ON DELETE CASCADE;


--
-- Name: production_job_items production_job_items_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_job_items
    ADD CONSTRAINT production_job_items_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.production_jobs(job_id) ON DELETE CASCADE;


--
-- Name: production_job_items production_job_items_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_job_items
    ADD CONSTRAINT production_job_items_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.printing_order_items(order_item_id) ON DELETE CASCADE;


--
-- Name: production_jobs production_jobs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_jobs
    ADD CONSTRAINT production_jobs_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.printing_orders(order_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PcHFNXwGaPtIauGC4EZWwrtRBfZd3FzuFSCBU5x5pTzUoiDkyw05tKkTPcxyXik

