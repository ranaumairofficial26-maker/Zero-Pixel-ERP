--
-- PostgreSQL database dump
--

\restrict uFmUloXPzDewjvSf6drcI0lLnPkFPGdSzKpE4sVZtUinGGxaRcOJ0v7gqM4KheI

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

\unrestrict uFmUloXPzDewjvSf6drcI0lLnPkFPGdSzKpE4sVZtUinGGxaRcOJ0v7gqM4KheI

